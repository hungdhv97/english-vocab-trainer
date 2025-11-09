package service

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/play/model"
)

// Service provides play-related operations.
type Service struct {
	db *pgxpool.Pool
}

// GetGameIDFromLevelID gets game_id from level_id via game_levels table.
func (s *Service) GetGameIDFromLevelID(ctx context.Context, levelID int64) (int64, error) {
	var gameID int64
	err := s.db.QueryRow(ctx, `SELECT game_id FROM game_levels WHERE level_id = $1 LIMIT 1`, levelID).Scan(&gameID)
	if err != nil {
		return 0, err
	}
	return gameID, nil
}

// New creates a new play service.
func New(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// RecordPlay stores a play result and updates session target and score totals.
// Updated to support both old schema (with scoring_config) and new schema (simple scoring) (T050).
func (s *Service) RecordPlay(p model.Play) (model.Play, int, error) {
	ctx := context.Background()
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return model.Play{}, 0, err
	}
	defer tx.Rollback(ctx)

	// Check if session uses new schema (has cefr_level_id) or old schema (has level_id with scoring_config)
	var hasCefrLevel bool
	var cefrLevelID pgtype.Int8
	err = tx.QueryRow(ctx, `SELECT cefr_level_id FROM game_sessions WHERE session_tag=$1`, p.SessionTag).Scan(&cefrLevelID)
	if err == nil && cefrLevelID.Valid {
		hasCefrLevel = true
	}

	if hasCefrLevel {
		// New schema: Simple scoring (1 point for correct, 0 for incorrect)
		if p.IsCorrect {
			p.Score = 1
			p.Target = 1
		} else {
			p.Score = 0
			p.Target = 0
		}
	} else {
		// Old schema: Use scoring_config from levels table
		var cfgRaw []byte
		if err := tx.QueryRow(ctx, `SELECT l.scoring_config FROM game_sessions g JOIN levels l ON g.level_id = l.id WHERE g.session_tag=$1`, p.SessionTag).Scan(&cfgRaw); err != nil {
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

		// fetch current target progress and wrong counts for target calculation
		var currentTarget, wrongCount int
		if err := tx.QueryRow(ctx, `SELECT COALESCE(SUM(target),0) FROM plays WHERE session_tag=$1`, p.SessionTag).Scan(&currentTarget); err != nil {
			return model.Play{}, 0, err
		}
		if err := tx.QueryRow(ctx, `SELECT COUNT(*) FROM plays WHERE session_tag=$1 AND is_correct=false`, p.SessionTag).Scan(&wrongCount); err != nil {
			return model.Play{}, 0, err
		}

		// compute the target delta first
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

		// compute score delta based on mode
		if p.IsCorrect {
			p.Score = cfg.ScoreRules.CorrectPoints
		} else {
			switch cfg.TargetRules.Mode {
			case "number":
				p.Score = cfg.ScoreRules.WrongPenalty
			case "formula":
				// For formula mode, multiply the wrong penalty by the absolute value of target reduction
				targetReduction := int(math.Abs(float64(p.Target)))
				p.Score = cfg.ScoreRules.WrongPenalty * targetReduction
			default:
				p.Score = cfg.ScoreRules.WrongPenalty
			}
		}
	}

	// Insert play with translation_id and correct_answer if provided (new schema)
	var playID int64
	var playedAt time.Time
	if p.TranslationID != nil && p.CorrectAnswer != "" {
		// New schema: Include translation_id and correct_answer
		err = tx.QueryRow(ctx, `
			INSERT INTO plays (user_id, word_id, session_tag, translation_id, user_answer, correct_answer, is_correct, score, target) 
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
			RETURNING id, played_at`, 
			p.UserID, p.WordID, p.SessionTag, p.TranslationID, p.UserAnswer, p.CorrectAnswer, p.IsCorrect, p.Score, p.Target).Scan(&playID, &playedAt)
	} else {
		// Old schema: No translation_id or correct_answer
		err = tx.QueryRow(ctx, `
			INSERT INTO plays (user_id, word_id, session_tag, user_answer, is_correct, score, target) 
			VALUES ($1,$2,$3,$4,$5,$6,$7) 
			RETURNING id, played_at`, 
			p.UserID, p.WordID, p.SessionTag, p.UserAnswer, p.IsCorrect, p.Score, p.Target).Scan(&playID, &playedAt)
	}
	if err != nil {
		return model.Play{}, 0, err
	}
	p.ID = playID
	p.PlayedAt = playedAt

	// Update session statistics
	// Calculate total score from plays (no longer stored in game_sessions)
	var total int
	if hasCefrLevel {
		// New schema: Update correct_count, incorrect_count, and accuracy_percentage (T051)
		var correctCount, incorrectCount int
		err = tx.QueryRow(ctx, `
			UPDATE game_sessions 
			SET correct_count = correct_count + CASE WHEN $1 THEN 1 ELSE 0 END,
				incorrect_count = incorrect_count + CASE WHEN $1 THEN 0 ELSE 1 END
			WHERE session_tag = $2
			RETURNING correct_count, incorrect_count`, 
			p.IsCorrect, p.SessionTag).Scan(&correctCount, &incorrectCount)
		if err != nil {
			return model.Play{}, 0, err
		}

		// Calculate total score from all plays in this session
		err = tx.QueryRow(ctx, `SELECT COALESCE(SUM(score), 0) FROM plays WHERE session_tag = $1`, p.SessionTag).Scan(&total)
		if err != nil {
			return model.Play{}, 0, err
		}

		// Calculate accuracy percentage
		totalAnswers := correctCount + incorrectCount
		var accuracyPercentage *float64
		if totalAnswers > 0 {
			accuracy := float64(correctCount) / float64(totalAnswers) * 100.0
			accuracyPercentage = &accuracy
		}

		// Update accuracy percentage
		if accuracyPercentage != nil {
			_, err = tx.Exec(ctx, `UPDATE game_sessions SET accuracy_percentage = $1 WHERE session_tag = $2`, *accuracyPercentage, p.SessionTag)
			if err != nil {
				return model.Play{}, 0, err
			}
		}
	} else {
		// Old schema: Calculate total_score from plays (for backward compatibility)
		err = tx.QueryRow(ctx, `SELECT COALESCE(SUM(score), 0) FROM plays WHERE session_tag=$1`, p.SessionTag).Scan(&total)
		if err != nil {
			return model.Play{}, 0, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return model.Play{}, 0, err
	}
	return p, total, nil
}

// GetHistory returns all plays for a user.
func (s *Service) GetHistory(userID int64) ([]model.HistoryEntry, error) {
	ctx := context.Background()
	// Note: This query uses old schema fields that no longer exist in Word model
	// TODO: Update to use new schema with language_id, translations (T054)
	// For now, we select only fields that exist in the new Word model
	// Note: game_sessions may still have level_id (old) or cefr_level_id (new)
	rows, err := s.db.Query(ctx, `SELECT
  p.id, p.user_id, p.user_answer, p.is_correct, p.score, p.target, p.played_at,
  p.session_tag,
  g.started_at, COALESCE(g.cefr_level_id, g.level_id) as level_id, g.total_score, g.finished_at,
  w.id, w.language_id, w.word_text, w.phonetic, w.part_of_speech, w.created_at, w.updated_at
FROM plays p
JOIN words w ON p.word_id = w.id
JOIN game_sessions g ON p.session_tag = g.session_tag
WHERE p.user_id=$1
ORDER BY p.played_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []model.HistoryEntry
	for rows.Next() {
		var h model.HistoryEntry
		var finished pgtype.Timestamptz
		var levelID pgtype.Int8
		if err := rows.Scan(
			&h.ID, &h.UserID, &h.UserAnswer, &h.IsCorrect, &h.Score, &h.Target, &h.PlayedAt,
			&h.Session.Tag,
			&h.Session.StartedAt, &levelID, &finished,
			&h.Word.ID, &h.Word.LanguageID, &h.Word.WordText, &h.Word.Phonetic, &h.Word.PartOfSpeech, &h.Word.CreatedAt, &h.Word.UpdatedAt,
		); err != nil {
			return nil, err
		}
		
		// Calculate total score from plays in this session (no longer stored in game_sessions)
		var totalScore int
		err = s.db.QueryRow(ctx, `SELECT COALESCE(SUM(score), 0) FROM plays WHERE session_tag = $1`, h.Session.Tag).Scan(&totalScore)
		if err != nil {
			return nil, err
		}
		
		if levelID.Valid {
			h.Session.CefrLevelID = &levelID.Int64
		}
		if finished.Valid {
			t := finished.Time
			h.Session.FinishedAt = &t
		} else {
			h.Session.FinishedAt = nil
		}
		h.Session.TotalScore = totalScore
		out = append(out, h)
	}
	return out, nil
}

// CreateSession creates a new game session for a user and level.
// Updated to support both old schema (level_id) and new schema (cefr_level_id, translation_direction) (T052).
func (s *Service) CreateSession(userID, levelID int64) (uuid.UUID, error) {
	// Get game_id from level_id for old schema
	ctx := context.Background()
	var oldGameID int64
	if err := s.db.QueryRow(ctx, `SELECT game_id FROM game_levels WHERE level_id = $1 LIMIT 1`, levelID).Scan(&oldGameID); err != nil {
		oldGameID = 0
	}
	return s.CreateSessionWithDirection(userID, oldGameID, levelID, 0, "")
}

// CreateSessionWithDirection creates a new game session with CEFR level and translation direction (new schema).
func (s *Service) CreateSessionWithDirection(userID int64, gameID int64, levelID int64, cefrLevelID int64, translationDirection string) (uuid.UUID, error) {
	tag := uuid.New()
	ctx := context.Background()
	
	// If cefrLevelID is provided, use new schema
	if cefrLevelID > 0 {
		// Validate translation direction if provided
		if translationDirection != "" && translationDirection != "en-to-vi" && translationDirection != "vi-to-en" {
			return uuid.Nil, fmt.Errorf("invalid translation direction: %s", translationDirection)
		}

		// Insert session with game_id, cefr_level_id and translation_direction (new schema)
		if translationDirection != "" {
			_, err := s.db.Exec(ctx, `
				INSERT INTO game_sessions (session_tag, user_id, game_id, cefr_level_id, translation_direction) 
				VALUES ($1,$2,$3,$4,$5)`, tag, userID, gameID, cefrLevelID, translationDirection)
			if err != nil {
				return uuid.Nil, err
			}
		} else {
			_, err := s.db.Exec(ctx, `
				INSERT INTO game_sessions (session_tag, user_id, game_id, cefr_level_id) 
				VALUES ($1,$2,$3,$4)`, tag, userID, gameID, cefrLevelID)
			if err != nil {
				return uuid.Nil, err
			}
		}
		return tag, nil
	}

	// Old schema: Use level_id
	// Get game_id from level_id via game_levels junction table (if not already provided)
	// Note: game_levels columns keep their names (game_id, level_id) but reference renamed tables
	if gameID == 0 {
		if err := s.db.QueryRow(ctx, `SELECT game_id FROM game_levels WHERE level_id = $1 LIMIT 1`, levelID).Scan(&gameID); err != nil {
			// If no game found, set game_id to NULL (optional field)
			gameID = 0
		}
	}
	
	// Insert session with game_id (can be NULL if no game found)
	// Note: After migration 005, user_id and level_id reference users.id and levels.id
	if gameID > 0 {
		if _, err := s.db.Exec(ctx, `INSERT INTO game_sessions (session_tag, user_id, level_id, game_id) VALUES ($1,$2,$3,$4)`, tag, userID, levelID, gameID); err != nil {
			return uuid.Nil, err
		}
	} else {
		if _, err := s.db.Exec(ctx, `INSERT INTO game_sessions (session_tag, user_id, level_id) VALUES ($1,$2,$3)`, tag, userID, levelID); err != nil {
			return uuid.Nil, err
		}
	}
	return tag, nil
}

// FinishSession marks a game session as finished and calculates final statistics (T053).
func (s *Service) FinishSession(tag uuid.UUID) error {
	ctx := context.Background()
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Check if session uses new schema (has cefr_level_id)
	var hasCefrLevel bool
	var cefrLevelID pgtype.Int8
	err = tx.QueryRow(ctx, `SELECT cefr_level_id FROM game_sessions WHERE session_tag=$1`, tag).Scan(&cefrLevelID)
	if err == nil && cefrLevelID.Valid {
		hasCefrLevel = true
	}

	if hasCefrLevel {
		// New schema: Calculate and update final statistics
		var correctCount, incorrectCount int
		err = tx.QueryRow(ctx, `
			SELECT 
				COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END), 0) as correct_count,
				COALESCE(SUM(CASE WHEN is_correct THEN 0 ELSE 1 END), 0) as incorrect_count
			FROM plays
			WHERE session_tag = $1`, tag).Scan(&correctCount, &incorrectCount)
		if err != nil {
			return err
		}

		// Calculate accuracy percentage
		totalAnswers := correctCount + incorrectCount
		var accuracyPercentage *float64
		if totalAnswers > 0 {
			accuracy := float64(correctCount) / float64(totalAnswers) * 100.0
			accuracyPercentage = &accuracy
		}

		// Update session with finished_at and final statistics
		if accuracyPercentage != nil {
			_, err = tx.Exec(ctx, `
				UPDATE game_sessions 
				SET finished_at = NOW(),
					correct_count = $1,
					incorrect_count = $2,
					accuracy_percentage = $3
				WHERE session_tag = $4`, 
				correctCount, incorrectCount, *accuracyPercentage, tag)
		} else {
			_, err = tx.Exec(ctx, `
				UPDATE game_sessions 
				SET finished_at = NOW(),
					correct_count = $1,
					incorrect_count = $2
				WHERE session_tag = $3`, 
				correctCount, incorrectCount, tag)
		}
		if err != nil {
			return err
		}
	} else {
		// Old schema: Only update finished_at
		_, err = tx.Exec(ctx, `UPDATE game_sessions SET finished_at = NOW() WHERE session_tag=$1`, tag)
		if err != nil {
			return err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}
	return nil
}
