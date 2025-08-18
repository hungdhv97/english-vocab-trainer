package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	redis "github.com/redis/go-redis/v9"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/word/model"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/translator"
)

// Service provides word-related operations.
type Service struct {
	db         *pgxpool.Pool
	cache      *redis.Client
	jwtSecret  []byte
	translator *translator.DeepLTranslator
}

// New creates a new word service.
func New(db *pgxpool.Pool, cache *redis.Client, secret string, translator *translator.DeepLTranslator) *Service {
	return &Service{db: db, cache: cache, jwtSecret: []byte(secret), translator: translator}
}

// GetRandomWords returns random words matching language and difficulty using a
// stateless cursor so clients can page through results without repetition.
// The cursor is a JWT containing "seed" and "offset".
func (s *Service) GetRandomWords(count int, language, difficulty, cursor string) ([]model.Word, string, error) {
	if count <= 0 {
		return nil, "", errors.New("invalid count")
	}

	seed := time.Now().UnixNano()
	offset := 0
	if cursor != "" {
		var claims struct {
			Seed   int64 `json:"seed"`
			Offset int   `json:"offset"`
			jwt.RegisteredClaims
		}
		token, err := jwt.ParseWithClaims(cursor, &claims, func(t *jwt.Token) (interface{}, error) {
			return s.jwtSecret, nil
		})
		if err == nil && token.Valid {
			seed = claims.Seed
			offset = claims.Offset
		}
	}

	ctx := context.Background()

	// Determine total number of words for the given language and difficulty.
	var n int
	if err := s.db.QueryRow(ctx, `SELECT COUNT(*) FROM universe_index WHERE language_code=$1 AND difficulty=$2`, language, difficulty).Scan(&n); err != nil {
		return nil, "", err
	}
	if n == 0 {
		return nil, "", errors.New("no words available")
	}

	// Generate a permutation based on the seed using r(t) = (a*t + b) mod N
	// where gcd(a, N) = 1 to ensure a full cycle without repetition.
	N := n
	a := int(seed%int64(N-1)) + 1
	for gcd(a, N) != 1 {
		a++
		if a >= N {
			a = 1
		}
	}
	b := int((seed / int64(N)) % int64(N))

	ranks := make([]int32, 0, count)
	for i := 0; i < count; i++ {
		t := offset + i
		r := (a*t + b) % N
		ranks = append(ranks, int32(r))
	}

	// Fetch words matching the calculated ranks.
	rows, err := s.db.Query(ctx, `SELECT ui.rank, w.word_id, w.concept_id, w.language_code, w.word_text, w.difficulty
                FROM universe_index ui
                JOIN words w ON ui.word_id = w.word_id
                WHERE ui.language_code=$1 AND ui.difficulty=$2 AND ui.rank = ANY($3)`, language, difficulty, ranks)
	if err != nil {
		return nil, "", err
	}
	defer rows.Close()

	fetched := make(map[int32]model.Word)
	for rows.Next() {
		var rank int32
		var w model.Word
		if err := rows.Scan(&rank, &w.ID, &w.ConceptID, &w.LanguageCode, &w.WordText, &w.Difficulty); err != nil {
			return nil, "", err
		}
		fetched[rank] = w
	}

	var words []model.Word
	for _, r := range ranks {
		if w, ok := fetched[r]; ok {
			words = append(words, w)
		}
	}

	var nextCursor string
	if len(words) > 0 {
		claims := jwt.MapClaims{
			"seed":   seed,
			"offset": offset + len(words),
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		signed, err := token.SignedString(s.jwtSecret)
		if err != nil {
			return nil, "", err
		}
		nextCursor = signed
	}

	return words, nextCursor, nil
}

// GetMeaning finds the translation for a word in another language, with Redis caching.
func (s *Service) GetMeaning(wordID int64, language string) (string, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("translation:%d:%s", wordID, strings.ToLower(language))
	if s.cache != nil {
		if val, err := s.cache.Get(ctx, cacheKey).Result(); err == nil && val != "" {
			return val, nil
		}
	}
	var correct string
	err := s.db.QueryRow(ctx, `
                                SELECT w2.word_text
                                FROM words w1
                                JOIN words w2 ON w1.concept_id = w2.concept_id AND LOWER(w2.language_code) = LOWER($2)
                                WHERE w1.word_id = $1
                                ORDER BY w2.is_primary DESC, w2.word_id ASC
                                LIMIT 1`, wordID, language).Scan(&correct)
	if err == nil && correct != "" {
		if s.cache != nil {
			_ = s.cache.Set(ctx, cacheKey, correct, 10*time.Minute).Err()
		}
		return correct, nil
	}

	var conceptID uuid.UUID
	var sourceLang, sourceText, diff string
	err = s.db.QueryRow(ctx, `SELECT concept_id, language_code, word_text, difficulty FROM words WHERE word_id=$1`, wordID).Scan(&conceptID, &sourceLang, &sourceText, &diff)
	if err != nil {
		return "", errors.New("word not found")
	}

	translated, err := s.translator.Translate(sourceText, sourceLang, language)
	if err != nil {
		return "", err
	}

	var newID int64
	insErr := s.db.QueryRow(ctx, `INSERT INTO words (concept_id, language_code, word_text, difficulty, is_primary) VALUES ($1,$2,$3,$4,true) RETURNING word_id`, conceptID, strings.ToLower(language), translated, diff).Scan(&newID)
	if insErr != nil {
		if strings.Contains(strings.ToLower(insErr.Error()), "duplicate") {
			err = s.db.QueryRow(ctx, `SELECT word_text FROM words WHERE concept_id=$1 AND LOWER(language_code)=LOWER($2) ORDER BY is_primary DESC, word_id ASC LIMIT 1`, conceptID, language).Scan(&translated)
			if err != nil {
				return "", err
			}
		} else {
			return "", insErr
		}
	}
	if s.cache != nil && translated != "" {
		_ = s.cache.Set(ctx, cacheKey, translated, 10*time.Minute).Err()
	}
	return translated, nil
}

// gcd computes the greatest common divisor using Euclid's algorithm.
func gcd(a, b int) int {
	for b != 0 {
		a, b = b, a%b
	}
	if a < 0 {
		return -a
	}
	return a
}
