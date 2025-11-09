package model

import (
	"time"

	"github.com/google/uuid"
	wordmodel "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/word/model"
)

// Play records a single answer attempt by a user.
type Play struct {
	ID            int64     `json:"id"`
	UserID        int64     `json:"user_id"`
	WordID        int64     `json:"word_id"`
	SessionTag    uuid.UUID `json:"session_tag"`
	TranslationID *int64    `json:"translation_id,omitempty"`
	UserAnswer    string    `json:"user_answer"`
	CorrectAnswer string    `json:"correct_answer"`
	IsCorrect     bool      `json:"is_correct"`
	Score         int       `json:"score"`
	Target        int       `json:"target"`
	PlayedAt      time.Time `json:"played_at"`
}

// SessionInfo holds metadata about a game session.
type SessionInfo struct {
	Tag                uuid.UUID  `json:"session_tag"`
	UserID             int64      `json:"user_id"`
	CefrLevelID        *int64     `json:"cefr_level_id,omitempty"`
	GameID             *int64     `json:"game_id,omitempty"`
	TranslationDirection string   `json:"translation_direction,omitempty"`
	TotalScore         int        `json:"total_score"`
	CorrectCount       int        `json:"correct_count"`
	IncorrectCount     int        `json:"incorrect_count"`
	AccuracyPercentage *float64   `json:"accuracy_percentage,omitempty"`
	StartedAt          time.Time  `json:"started_at"`
	FinishedAt         *time.Time `json:"finished_at,omitempty"`
}

// HistoryEntry represents a play joined with its word details for history views.
type HistoryEntry struct {
	ID            int64          `json:"id"`
	UserID        int64          `json:"user_id"`
	Word          wordmodel.Word `json:"word"`
	UserAnswer    string         `json:"user_answer"`
	IsCorrect     bool           `json:"is_correct"`
	Score         int            `json:"score"`
	Target        int            `json:"target"`
	PlayedAt      time.Time      `json:"played_at"`
	Session       SessionInfo    `json:"session"`
	CorrectAnswer string         `json:"correct_answer"`
}
