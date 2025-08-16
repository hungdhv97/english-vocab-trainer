package model

import "time"

// User represents a player of the game.
type User struct {
	ID           int64     `json:"user_id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}
