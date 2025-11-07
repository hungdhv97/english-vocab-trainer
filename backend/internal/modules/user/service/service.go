package service

import (
	"context"
	"errors"
	"log"
	"regexp"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/user/model"
)

// Service provides user-related operations.
type Service struct {
	db *pgxpool.Pool
}

// New creates a new user service.
func New(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// Register registers a new user with hashed password.
func (s *Service) Register(username, password string) (model.User, error) {
	if strings.TrimSpace(username) == "" {
		return model.User{}, errors.New("username cannot be empty")
	}
	if strings.TrimSpace(password) == "" {
		return model.User{}, errors.New("password cannot be empty")
	}
	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return model.User{}, err
	}
	ctx := context.Background()
	var user model.User
	err = s.db.QueryRow(ctx, `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id, username, password_hash, is_active, created_at`, username, string(hashBytes)).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.IsActive, &user.CreatedAt)
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "duplicate") || strings.Contains(err.Error(), "unique") {
			return model.User{}, errors.New("username already exists")
		}
		return model.User{}, err
	}
	return user, nil
}

// Authenticate verifies user credentials.
func (s *Service) Authenticate(username, password string) (model.User, error) {
	ctx := context.Background()
	var user model.User
	err := s.db.QueryRow(ctx, `SELECT user_id, username, password_hash, is_active, created_at FROM users WHERE username=$1`, username).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.IsActive, &user.CreatedAt)
	if err != nil {
		return model.User{}, errors.New("user not found")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return model.User{}, errors.New("invalid credentials")
	}
	if !user.IsActive {
		return model.User{}, errors.New("account is inactive")
	}
	return user, nil
}

// ValidateRedirectURL validates a redirect URL for security purposes.
// T052 [US4]: Validates against pattern `^/game/[a-z0-9-]+$`
// Rejects: absolute URLs, protocol-relative URLs, JavaScript URLs
// Logs rejected attempts for security monitoring
func (s *Service) ValidateRedirectURL(url, clientIP string) bool {
	// Empty URL is invalid
	if strings.TrimSpace(url) == "" {
		return false
	}

	// Security checks: reject dangerous patterns
	urlLower := strings.ToLower(url)

	// Reject absolute URLs (http://, https://, ftp://, etc.)
	if strings.Contains(urlLower, "://") {
		log.Printf("[SECURITY] Rejected absolute URL redirect attempt from %s: %s", clientIP, url)
		return false
	}

	// Reject protocol-relative URLs (//example.com)
	if strings.HasPrefix(url, "//") {
		log.Printf("[SECURITY] Rejected protocol-relative URL redirect attempt from %s: %s", clientIP, url)
		return false
	}

	// Reject javascript: URLs
	if strings.HasPrefix(urlLower, "javascript:") {
		log.Printf("[SECURITY] Rejected JavaScript URL redirect attempt from %s: %s", clientIP, url)
		return false
	}

	// Reject data: URLs
	if strings.HasPrefix(urlLower, "data:") {
		log.Printf("[SECURITY] Rejected data URL redirect attempt from %s: %s", clientIP, url)
		return false
	}

	// Valid pattern: /game/{game-code} where game-code is lowercase alphanumeric with hyphens
	validPattern := regexp.MustCompile(`^/game/[a-z0-9-]+$`)
	if !validPattern.MatchString(url) {
		log.Printf("[SECURITY] Rejected invalid redirect URL pattern from %s: %s", clientIP, url)
		return false
	}

	return true
}
