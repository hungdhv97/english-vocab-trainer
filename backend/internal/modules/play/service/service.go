package service

import (
	"context"
	"encoding/json"
	"math"

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

// RecordPlay stores a play result and updates session target and score totals.
func (s *Service) RecordPlay(p model.Play) (model.Play, int, error) {
	ctx := context.Background()
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return model.Play{}, 0, err
	}
	defer tx.Rollback(ctx)

	var cfgRaw []byte
	if err := tx.QueryRow(ctx, `SELECT l.scoring_config FROM game_sessions g JOIN levels l ON g.level_id = l.level_id WHERE g.session_tag=$1`, p.SessionTag).Scan(&cfgRaw); err != nil {
		return model.Play{}, 0, err
	}

	var cfg struct {
		TargetRules struct {
			CorrectBonus int         `json:"correct_bonus"`
			WrongPenalty interface{} `json:"wrong_penalty"`
			Mode         string      `json:"mode"`
		} `json:"target_rules"`
		ScoreRules struct {
			CorrectPoints int `json:"correct_points"`
			WrongPenalty  int `json:"wrong_penalty"`
		} `json:"score_rules"`
	}
	if err := json.Unmarshal(cfgRaw, &cfg); err != nil {
		return model.Play{}, 0, err
	}

	// compute score delta
	if p.IsCorrect {
		p.Score = cfg.ScoreRules.CorrectPoints
	} else {
		p.Score = cfg.ScoreRules.WrongPenalty
	}

	// fetch current target progress and wrong counts for target calculation
	var currentTarget, wrongCount int
	if err := tx.QueryRow(ctx, `SELECT COALESCE(SUM(target),0) FROM plays WHERE session_tag=$1`, p.SessionTag).Scan(&currentTarget); err != nil {
		return model.Play{}, 0, err
	}
	if err := tx.QueryRow(ctx, `SELECT COUNT(*) FROM plays WHERE session_tag=$1 AND is_correct=false`, p.SessionTag).Scan(&wrongCount); err != nil {
		return model.Play{}, 0, err
	}

	if p.IsCorrect {
		p.Target = cfg.TargetRules.CorrectBonus
	} else {
		switch cfg.TargetRules.Mode {
		case "number":
			switch v := cfg.TargetRules.WrongPenalty.(type) {
			case float64:
				p.Target = int(v)
			case int:
				p.Target = v
			}
		case "formula":
			if s, ok := cfg.TargetRules.WrongPenalty.(string); ok {
				switch s {
				case "arithmetic":
					p.Target = -(wrongCount + 1)
				case "geometric":
					p.Target = -int(math.Pow(2, float64(wrongCount)))
				case "reset":
					p.Target = -currentTarget
				}
			}
		}
	}

	err = tx.QueryRow(ctx, `INSERT INTO plays (user_id, word_id, session_tag, user_answer, is_correct, score, target) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING play_id, played_at`, p.UserID, p.WordID, p.SessionTag, p.UserAnswer, p.IsCorrect, p.Score, p.Target).Scan(&p.ID, &p.PlayedAt)
	if err != nil {
		return model.Play{}, 0, err
	}
	var total int
	if err := tx.QueryRow(ctx, `UPDATE game_sessions SET total_score = total_score + $1 WHERE session_tag=$2 RETURNING total_score`, p.Score, p.SessionTag).Scan(&total); err != nil {
		return model.Play{}, 0, err
	}
	if err := tx.Commit(ctx); err != nil {
		return model.Play{}, 0, err
	}
	return p, total, nil
}

// GetHistory returns all plays for a user.
func (s *Service) GetHistory(userID int64) ([]model.HistoryEntry, error) {
	ctx := context.Background()
	rows, err := s.db.Query(ctx, `SELECT p.play_id, p.user_id, p.user_answer, p.is_correct, p.score, p.target, p.played_at, p.session_tag, g.started_at, w.word_id, w.concept_id, w.language_code, w.word_text, w.difficulty, w.is_primary FROM plays p JOIN words w ON p.word_id = w.word_id JOIN game_sessions g ON p.session_tag = g.session_tag WHERE p.user_id=$1 ORDER BY p.played_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.HistoryEntry
	for rows.Next() {
		var h model.HistoryEntry
		if err := rows.Scan(&h.ID, &h.UserID, &h.UserAnswer, &h.IsCorrect, &h.Score, &h.Target, &h.PlayedAt, &h.Session.Tag, &h.Session.StartedAt, &h.Word.ID, &h.Word.ConceptID, &h.Word.LanguageCode, &h.Word.WordText, &h.Word.Difficulty, &h.Word.IsPrimary); err != nil {
			return nil, err
		}
		out = append(out, h)
	}
	return out, nil
}

// CreateSession creates a new game session for a user and level.
func (s *Service) CreateSession(userID, levelID int64) (uuid.UUID, error) {
	tag := uuid.New()
	ctx := context.Background()
	if _, err := s.db.Exec(ctx, `INSERT INTO game_sessions (session_tag, user_id, level_id) VALUES ($1,$2,$3)`, tag, userID, levelID); err != nil {
		return uuid.Nil, err
	}
	return tag, nil
}

// FinishSession marks a game session as finished.
func (s *Service) FinishSession(tag uuid.UUID) error {
	ctx := context.Background()
	_, err := s.db.Exec(ctx, `UPDATE game_sessions SET finished_at = NOW() WHERE session_tag=$1`, tag)
	return err
}
