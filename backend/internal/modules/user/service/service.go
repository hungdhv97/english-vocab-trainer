package service

import (
	"context"
	"errors"
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
	err = s.db.QueryRow(ctx, `INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id, username, password_hash, created_at`, username, string(hashBytes)).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.CreatedAt)
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
	err := s.db.QueryRow(ctx, `SELECT user_id, username, password_hash, created_at FROM users WHERE username=$1`, username).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return model.User{}, errors.New("user not found")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return model.User{}, errors.New("invalid credentials")
	}
	return user, nil
}
