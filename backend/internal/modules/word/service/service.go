package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
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
// Updated to use new schema with language_id (T035) and support translations/cefr_levels (T036).
// Note: This method is maintained for backward compatibility. New vocab quiz should use VocabQuiz service.
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

	// Get language ID
	var languageID int64
	err := s.db.QueryRow(ctx, `SELECT id FROM languages WHERE code = $1`, language).Scan(&languageID)
	if err != nil {
		return nil, "", fmt.Errorf("language not found: %w", err)
	}

	// Build query to count words
	// Try to use universe_index first (for backward compatibility during migration)
	// Fall back to direct words query if universe_index is not available
	var n int

	// If difficulty is provided, try to filter by it (for backward compatibility)
	// Note: difficulty column may still exist during migration
	if difficulty != "" {
		// Try universe_index first (if it exists)
		err = s.db.QueryRow(ctx, `
			SELECT COUNT(*) FROM universe_index ui
			JOIN words w ON ui.word_id = w.id
			WHERE ui.language_code = $1 AND ui.difficulty = $2`, language, difficulty).Scan(&n)
		if err == nil && n > 0 {
			// Use universe_index approach
			// Generate permutation
			N := n
			if N <= 1 {
				return nil, "", errors.New("no words available")
			}
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

			rows, err := s.db.Query(ctx, `
				SELECT w.id, w.word_text, w.language_id
				FROM universe_index ui
				JOIN words w ON ui.word_id = w.id
				WHERE ui.language_code = $1 AND ui.difficulty = $2 AND ui.rank = ANY($3)
				ORDER BY ui.rank`, language, difficulty, ranks)
			if err != nil {
				return nil, "", err
			}
			defer rows.Close()

			var words []model.Word
			for rows.Next() {
				var w model.Word
				if err := rows.Scan(&w.ID, &w.WordText, &w.LanguageID); err != nil {
					return nil, "", err
				}
				words = append(words, w)
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
		// Fall through to direct words query
	}

	// Use direct words query with language_id (new schema)
	// Optionally filter by difficulty if column still exists
	query := `SELECT COUNT(*) FROM words w WHERE w.language_id = $1`
	args := []interface{}{languageID}

	if difficulty != "" {
		// Check if difficulty column exists and filter by it
		query += ` AND w.difficulty = $2`
		args = append(args, difficulty)
	}

	err = s.db.QueryRow(ctx, query, args...).Scan(&n)
	if err != nil {
		return nil, "", fmt.Errorf("failed to count words: %w", err)
	}
	if n == 0 {
		return nil, "", errors.New("no words available")
	}

	// For direct query, use OFFSET and LIMIT with deterministic ordering
	// Use a seeded random approach for consistency
	// Simple approach: use modulo with seed to get deterministic "random" selection
	wordsPerPage := count
	page := offset / wordsPerPage

	selectQuery := `
		SELECT w.id, w.word_text, w.language_id
		FROM words w
		WHERE w.language_id = $1`
	selectArgs := []interface{}{languageID}

	if difficulty != "" {
		selectQuery += ` AND w.difficulty = $2`
		selectArgs = append(selectArgs, difficulty)
	}

	// Use seed to create deterministic ordering
	// Hash the seed with row number for pseudo-random but deterministic selection
	selectQuery += ` ORDER BY (w.id * $` + fmt.Sprintf("%d", len(selectArgs)+1) + ` + $` + fmt.Sprintf("%d", len(selectArgs)+2) + `) % 1000`
	selectArgs = append(selectArgs, int(seed%1000), int((seed/1000)%1000))
	selectQuery += ` LIMIT $` + fmt.Sprintf("%d", len(selectArgs)+1) + ` OFFSET $` + fmt.Sprintf("%d", len(selectArgs)+2)
	selectArgs = append(selectArgs, wordsPerPage, page*wordsPerPage)

	rows, err := s.db.Query(ctx, selectQuery, selectArgs...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to query words: %w", err)
	}
	defer rows.Close()

	var words []model.Word
	for rows.Next() {
		var w model.Word
		if err := rows.Scan(&w.ID, &w.WordText, &w.LanguageID); err != nil {
			return nil, "", err
		}
		words = append(words, w)
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
// Updated to use translations table instead of concept_id relationships (T037).
func (s *Service) GetMeaning(wordID int64, language string) (string, error) {
	ctx := context.Background()
	cacheKey := fmt.Sprintf("translation:%d:%s", wordID, strings.ToLower(language))
	if s.cache != nil {
		if val, err := s.cache.Get(ctx, cacheKey).Result(); err == nil && val != "" {
			return val, nil
		}
	}

	// Try to get translation from translations table (new schema)
	var correct string
	err := s.db.QueryRow(ctx, `
		SELECT w2.word_text
		FROM translations t
		JOIN words w1 ON t.from_word_id = w1.id
		JOIN words w2 ON t.to_word_id = w2.id
		JOIN languages l ON w2.language_id = l.id
		WHERE w1.id = $1
		AND LOWER(l.code) = LOWER($2)
		ORDER BY t.meaning_order ASC
		LIMIT 1`, wordID, language).Scan(&correct)
	
	if err == nil && correct != "" {
		if s.cache != nil {
			_ = s.cache.Set(ctx, cacheKey, correct, 10*time.Minute).Err()
		}
		return correct, nil
	}

	// Fallback: Try reverse direction (word might be to_word instead of from_word)
	err = s.db.QueryRow(ctx, `
		SELECT w1.word_text
		FROM translations t
		JOIN words w1 ON t.from_word_id = w1.id
		JOIN words w2 ON t.to_word_id = w2.id
		JOIN languages l ON w1.language_id = l.id
		WHERE w2.id = $1
		AND LOWER(l.code) = LOWER($2)
		ORDER BY t.meaning_order ASC
		LIMIT 1`, wordID, language).Scan(&correct)
	
	if err == nil && correct != "" {
		if s.cache != nil {
			_ = s.cache.Set(ctx, cacheKey, correct, 10*time.Minute).Err()
		}
		return correct, nil
	}

	// Fallback to old schema for backward compatibility during migration
	// This will be removed once all data is migrated
	var sourceLangCode, sourceText string
	var sourceLangID int64
	err = s.db.QueryRow(ctx, `
		SELECT w.word_text, w.language_id, l.code
		FROM words w
		JOIN languages l ON w.language_id = l.id
		WHERE w.id = $1`, wordID).Scan(&sourceText, &sourceLangID, &sourceLangCode)
	if err != nil {
		return "", errors.New("word not found")
	}

	// Get target language ID
	var targetLangID int64
	err = s.db.QueryRow(ctx, `SELECT id FROM languages WHERE LOWER(code) = LOWER($1)`, language).Scan(&targetLangID)
	if err != nil {
		return "", errors.New("target language not found")
	}

	// Translate using DeepL
	translated, err := s.translator.Translate(sourceText, sourceLangCode, language)
	if err != nil {
		return "", err
	}

	// Find or create target word
	var targetWordID int64
	err = s.db.QueryRow(ctx, `
		SELECT id FROM words 
		WHERE language_id = $1 AND word_text = $2 
		LIMIT 1`, targetLangID, translated).Scan(&targetWordID)
	
	if err != nil {
		// Target word doesn't exist, create it
		// Note: We don't have phonetic or part_of_speech, so they'll be NULL
		err = s.db.QueryRow(ctx, `
			INSERT INTO words (language_id, word_text)
			VALUES ($1, $2)
			RETURNING id`, targetLangID, translated).Scan(&targetWordID)
		if err != nil {
			return "", fmt.Errorf("failed to create target word: %w", err)
		}
	}

	// Check if translation already exists
	var existingTranslationID int64
	err = s.db.QueryRow(ctx, `
		SELECT id FROM translations 
		WHERE from_word_id = $1 AND to_word_id = $2 
		LIMIT 1`, wordID, targetWordID).Scan(&existingTranslationID)
	
	if err != nil {
		// Translation doesn't exist, create it
		// Note: We don't set cefr_level_id here as we don't know the level
		_, insertErr := s.db.Exec(ctx, `
			INSERT INTO translations (from_word_id, to_word_id, meaning_order, note)
			VALUES ($1, $2, 1, 'Auto-translated')`, wordID, targetWordID)
		if insertErr != nil {
			// If insert fails, translation might have been created concurrently
			// Try to get it again
			err = s.db.QueryRow(ctx, `
				SELECT w2.word_text
				FROM translations t
				JOIN words w2 ON t.to_word_id = w2.id
				JOIN languages l ON w2.language_id = l.id
				WHERE t.from_word_id = $1
				AND LOWER(l.code) = LOWER($2)
				ORDER BY t.meaning_order ASC
				LIMIT 1`, wordID, language).Scan(&translated)
			if err != nil {
				return "", fmt.Errorf("failed to create translation: %w", insertErr)
			}
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
