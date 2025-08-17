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
func (s *Service) GetHistory(userID int64) ([]model.HistoryEntry, error) {
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `SELECT p.play_id, p.user_id, p.user_answer, p.is_correct, p.response_time, p.earned_score, p.played_at, p.session_tag, w.word_id, w.concept_id, w.language_code, w.word_text, w.difficulty, w.is_primary FROM plays p JOIN words w ON p.word_id = w.word_id WHERE p.user_id=$1 ORDER BY p.played_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.HistoryEntry
	for rows.Next() {
		var h model.HistoryEntry
		if err := rows.Scan(&h.ID, &h.UserID, &h.UserAnswer, &h.IsCorrect, &h.ResponseTime, &h.EarnedScore, &h.PlayedAt, &h.SessionTag, &h.Word.ID, &h.Word.ConceptID, &h.Word.LanguageCode, &h.Word.WordText, &h.Word.Difficulty, &h.Word.IsPrimary); err != nil {
			return nil, err
		}
		out = append(out, h)
	}
	return out, nil
}

// CreateSession generates a new session tag.
func (s *Service) CreateSession() uuid.UUID {
	return uuid.New()
}
