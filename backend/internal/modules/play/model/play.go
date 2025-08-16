package model

import (
	"time"

	"github.com/google/uuid"
)

// Play records a single answer attempt by a user.
type Play struct {
	ID           int64     `json:"play_id"`
	UserID       int64     `json:"user_id"`
	WordID       int64     `json:"word_id"`
	UserAnswer   string    `json:"user_answer"`
	IsCorrect    bool      `json:"is_correct"`
	ResponseTime int       `json:"response_time"`
	EarnedScore  int       `json:"earned_score"`
	PlayedAt     time.Time `json:"played_at"`
	SessionTag   uuid.UUID `json:"session_tag"`
}
