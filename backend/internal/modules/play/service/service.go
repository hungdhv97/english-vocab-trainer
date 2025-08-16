package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/play/model"
)

// Service provides play-related operations.
type Service struct {
	db *pgxpool.Pool
}

// New creates a new play service.
func New(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// RecordPlay stores a play result.
func (s *Service) RecordPlay(p model.Play) (model.Play, error) {
	ctx := context.Background()
	err := s.db.QueryRow(ctx, `INSERT INTO plays (user_id, word_id, user_answer, is_correct, response_time, earned_score, session_tag) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING play_id, played_at`, p.UserID, p.WordID, p.UserAnswer, p.IsCorrect, p.ResponseTime, p.EarnedScore, p.SessionTag).Scan(&p.ID, &p.PlayedAt)
	if err != nil {
		return model.Play{}, err
	}
	return p, nil
}

// GetHistory returns all plays for a user.
func (s *Service) GetHistory(userID int64) ([]model.Play, error) {
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `SELECT play_id, user_id, word_id, user_answer, is_correct, response_time, earned_score, played_at, session_tag FROM plays WHERE user_id=$1 ORDER BY played_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.Play
	for rows.Next() {
		var p model.Play
		if err := rows.Scan(&p.ID, &p.UserID, &p.WordID, &p.UserAnswer, &p.IsCorrect, &p.ResponseTime, &p.EarnedScore, &p.PlayedAt, &p.SessionTag); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, nil
}

// CreateSession generates a new session tag.
func (s *Service) CreateSession() uuid.UUID {
	return uuid.New()
}
