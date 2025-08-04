package models

import "time"

// Word represents a vocabulary word.
	type Word struct {
	ID        int64     `json:"id"`
	English   string    `json:"english"`
	Vietnamese string    `json:"vietnamese"`
	Example   string    `json:"example,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}

// User represents a user of the application.
	type User struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Password  string    `json:"-"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// ReviewLog represents a single review event for a user and a word.
	type ReviewLog struct {
	ID           int64     `json:"id"`
	UserID       int64     `json:"user_id"`
	WordID       int64     `json:"word_id"`
	NextReview   time.Time `json:"next_review"`
	Interval     int       `json:"interval"`
	Repetitions  int       `json:"repetitions"`
	EaseFactor   float64   `json:"ease_factor"`
	LastReviewed time.Time `json:"last_reviewed"`
}