package models

import (
	"github.com/google/uuid"
	"time"
)

// User represents a player of the game.
type User struct {
	ID           int64     `json:"user_id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

// Word represents a single word in a specific language.
type Word struct {
	ID           int64     `json:"word_id"`
	ConceptID    uuid.UUID `json:"concept_id"`
	LanguageCode string    `json:"language_code"`
	WordText     string    `json:"word_text"`
	Difficulty   string    `json:"difficulty"`
}

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
