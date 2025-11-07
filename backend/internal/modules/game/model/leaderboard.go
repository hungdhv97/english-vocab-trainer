package model

import "time"

// LeaderboardEntry represents a single entry in a game's leaderboard.
// This is a derived entity (not stored directly in database) generated from queries
// across game_sessions and users tables.
type LeaderboardEntry struct {
	Rank       int       `json:"rank"`        // Player's position in leaderboard (1 = highest score)
	UserID     int64     `json:"user_id"`     // Unique identifier of the player
	Username   string    `json:"username"`    // Player's display name
	Score      int       `json:"score"`       // Player's best score for this game
	AchievedAt time.Time `json:"achieved_at"` // Timestamp when best score was achieved
}

// LeaderboardResponse represents the API response for a game's leaderboard.
type LeaderboardResponse struct {
	GameID      int64              `json:"game_id"`
	GameName    string             `json:"game_name"`
	Leaderboard []LeaderboardEntry `json:"leaderboard"`
}
