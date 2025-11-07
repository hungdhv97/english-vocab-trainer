package model

import "time"

// Game represents a vocabulary learning game displayed on the home page.
// Games are user-facing collections of learning activities that may span multiple difficulty levels.
type Game struct {
	GameID       int64     `json:"game_id" db:"game_id"`
	Code         string    `json:"code" db:"code"`
	Name         string    `json:"name" db:"name"`
	Description  string    `json:"description" db:"description"`
	IconPath     *string   `json:"icon_path" db:"icon_path"` // Nullable - relative path to icon in public assets
	Category     *string   `json:"category" db:"category"`   // Nullable - e.g., "vocabulary", "grammar", "pronunciation", "mixed"
	DisplayOrder int       `json:"display_order" db:"display_order"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

// GameLevel represents the many-to-many relationship between games and levels.
type GameLevel struct {
	GameID  int64 `json:"game_id" db:"game_id"`
	LevelID int64 `json:"level_id" db:"level_id"`
}

