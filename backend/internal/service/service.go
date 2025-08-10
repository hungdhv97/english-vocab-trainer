package service

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
	redis "github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

// Service provides game operations backed by PostgreSQL and Redis.
type Service struct {
	db    *pgxpool.Pool
	cache *redis.Client
}

// NewService creates a new Service, connecting to PostgreSQL and Redis using environment variables.
// Required envs:
// - PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
// - REDIS_ADDR (e.g., "redis:6379"), REDIS_PASSWORD (optional), REDIS_USERNAME (optional)
func NewService() *Service {
	ctx := context.Background()

	pgHost := getEnv("PGHOST", "postgres")
	pgPort := getEnv("PGPORT", "5432")
	pgUser := getEnv("PGUSER", "user")
	pgPass := getEnv("PGPASSWORD", "password")
	pgDB := getEnv("PGDATABASE", "vocab")

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", pgUser, pgPass, pgHost, pgPort, pgDB)

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		panic(fmt.Errorf("failed to create pg pool: %w", err))
	}
	if err := pool.Ping(ctx); err != nil {
		panic(fmt.Errorf("failed to connect postgres: %w", err))
	}

	// Seed minimal words if empty
	if err := seedWordsIfEmpty(ctx, pool); err != nil {
		panic(fmt.Errorf("failed to seed words: %w", err))
	}

	// Redis client
	redisAddr := getEnv("REDIS_ADDR", "redis:6379")
	redisUser := os.Getenv("REDIS_USERNAME")
	redisPass := os.Getenv("REDIS_PASSWORD")

	rdb := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Username: redisUser,
		Password: redisPass,
		DB:       0,
	})
	if err := rdb.Ping(ctx).Err(); err != nil {
		panic(fmt.Errorf("failed to connect redis: %w", err))
	}

	return &Service{db: pool, cache: rdb}
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func seedWordsIfEmpty(ctx context.Context, pool *pgxpool.Pool) error {
	// Check if words table exists first
	var tableExists bool
	err := pool.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = 'words'
		)`).Scan(&tableExists)
	if err != nil {
		return fmt.Errorf("failed to check if words table exists: %w", err)
	}
	if !tableExists {
		return fmt.Errorf("words table does not exist, migrations may have failed")
	}

	var cnt int64
	if err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM words").Scan(&cnt); err != nil {
		return err
	}
	if cnt > 0 {
		return nil
	}

	fmt.Println("Seeding database with sample words...")
	// Insert three pairs: (en, vi, easy)
	type pair struct{ en, vi, diff string }
	pairs := []pair{{"apple", "táo", "easy"}, {"banana", "chuối", "easy"}, {"cat", "mèo", "easy"}}
	for _, p := range pairs {
		concept := uuid.New()
		if _, err := pool.Exec(ctx, `INSERT INTO words (concept_id, language_code, word_text, difficulty, is_primary) VALUES ($1,'en',$2,$3,true), ($1,'vi',$4,$3,true)`, concept, p.en, p.diff, p.vi); err != nil {
			return err
		}
	}
	return nil
}

// RegisterUser registers a new user with hashed password.
func (s *Service) RegisterUser(username, password string) (models.User, error) {
	if strings.TrimSpace(username) == "" {
		return models.User{}, errors.New("username cannot be empty")
	}
	if strings.TrimSpace(password) == "" {
		return models.User{}, errors.New("password cannot be empty")
	}
	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return models.User{}, err
	}
	ctx := context.Background()
	var user models.User
	err = s.db.QueryRow(ctx, `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id, username, password_hash, created_at`, username, string(hashBytes)).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") || strings.Contains(err.Error(), "unique") {
			return models.User{}, errors.New("username already exists")
		}
		return models.User{}, err
	}
	return user, nil
}

// Authenticate verifies user credentials.
func (s *Service) Authenticate(username, password string) (models.User, error) {
	ctx := context.Background()
	var user models.User
	err := s.db.QueryRow(ctx, `SELECT user_id, username, password_hash, created_at FROM users WHERE username=$1`, username).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return models.User{}, errors.New("user not found")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return models.User{}, errors.New("invalid credentials")
	}
	return user, nil
}

// GetRandomWords returns random words matching language and difficulty.
func (s *Service) GetRandomWords(count int, language, difficulty string) ([]models.Word, error) {
	if count <= 0 {
		return nil, errors.New("invalid count")
	}
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `SELECT word_id, concept_id, language_code, word_text, difficulty FROM words WHERE language_code=$1 AND difficulty=$2 ORDER BY random() LIMIT $3`, language, difficulty, count)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var words []models.Word
	for rows.Next() {
		var w models.Word
		if err := rows.Scan(&w.ID, &w.ConceptID, &w.LanguageCode, &w.WordText, &w.Difficulty); err != nil {
			return nil, err
		}
		words = append(words, w)
	}
	if len(words) == 0 {
		return nil, errors.New("no words found")
	}
	return words, nil
}

// RecordPlay stores a play result.
func (s *Service) RecordPlay(p models.Play) (models.Play, error) {
	ctx := context.Background()
	err := s.db.QueryRow(ctx, `INSERT INTO plays (user_id, word_id, user_answer, is_correct, response_time, earned_score, session_tag) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING play_id, played_at`, p.UserID, p.WordID, p.UserAnswer, p.IsCorrect, p.ResponseTime, p.EarnedScore, p.SessionTag).Scan(&p.ID, &p.PlayedAt)
	if err != nil {
		return models.Play{}, err
	}
	return p, nil
}

// GetHistory returns all plays for a user.
func (s *Service) GetHistory(userID int64) ([]models.Play, error) {
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `SELECT play_id, user_id, word_id, user_answer, is_correct, response_time, earned_score, played_at, session_tag FROM plays WHERE user_id=$1 ORDER BY played_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []models.Play
	for rows.Next() {
		var p models.Play
		if err := rows.Scan(&p.ID, &p.UserID, &p.WordID, &p.UserAnswer, &p.IsCorrect, &p.ResponseTime, &p.EarnedScore, &p.PlayedAt, &p.SessionTag); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, nil
}

// GetTranslation finds the translation for a word in another language, with Redis caching.
func (s *Service) GetTranslation(wordID int64, language string) (string, error) {
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
	if err != nil {
		return "", errors.New("translation not found")
	}
	if s.cache != nil && correct != "" {
		_ = s.cache.Set(ctx, cacheKey, correct, 10*time.Minute).Err()
	}
	return correct, nil
}

// CreateSession generates a new session tag.
func (s *Service) CreateSession() uuid.UUID {
	return uuid.New()
}
