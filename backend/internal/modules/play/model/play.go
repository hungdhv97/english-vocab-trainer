package model

import (
	"time"

	"github.com/google/uuid"
	wordmodel "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/word/model"
)

// Play records a single answer attempt by a user.
type Play struct {
	ID         int64     `json:"play_id"`
	UserID     int64     `json:"user_id"`
	WordID     int64     `json:"word_id"`
	UserAnswer string    `json:"user_answer"`
	IsCorrect  bool      `json:"is_correct"`
	Score      int       `json:"score"`
	Target     int       `json:"target"`
	PlayedAt   time.Time `json:"played_at"`
	SessionTag uuid.UUID `json:"session_tag"`
}

// HistoryEntry represents a play joined with its word details for history views.
type HistoryEntry struct {
	ID         int64          `json:"play_id"`
	UserID     int64          `json:"user_id"`
	Word       wordmodel.Word `json:"word"`
	UserAnswer string         `json:"user_answer"`
	IsCorrect  bool           `json:"is_correct"`
	Score      int            `json:"score"`
	Target     int            `json:"target"`
	PlayedAt   time.Time      `json:"played_at"`
	SessionTag uuid.UUID      `json:"session_tag"`
}
