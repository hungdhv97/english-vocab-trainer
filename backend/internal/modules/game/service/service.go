package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/game/model"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

// Service handles business logic for game operations.
type Service struct {
	db    *pgxpool.Pool
	redis *redis.Client
}

// NewService creates a new game service instance.
// Accepts a PostgreSQL connection pool for database operations
// and a Redis client for caching.
func NewService(db *pgxpool.Pool, redisClient *redis.Client) *Service {
	return &Service{
		db:    db,
		redis: redisClient,
	}
}

// ListActiveGames retrieves all active games ordered by display_order and name.
// Returns games that are marked as active (is_active = TRUE) for display on the home page.
func (s *Service) ListActiveGames(ctx context.Context) ([]model.Game, error) {
	query := `
		SELECT 
			id, 
			code, 
			name, 
			description, 
			icon_path, 
			category, 
			display_order, 
			is_active, 
			created_at, 
			updated_at
		FROM games
		WHERE is_active = TRUE
		ORDER BY display_order ASC, name ASC
	`

	rows, err := s.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var games []model.Game
	for rows.Next() {
		var game model.Game
		err := rows.Scan(
			&game.ID,
			&game.Code,
			&game.Name,
			&game.Description,
			&game.IconPath,
			&game.Category,
			&game.DisplayOrder,
			&game.IsActive,
			&game.CreatedAt,
			&game.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		games = append(games, game)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	// Return empty slice instead of nil if no games found
	if games == nil {
		games = []model.Game{}
	}

	return games, nil
}

// GetLeaderboard retrieves the top 10 players for a specific game.
// Uses the new vocab_game_sessions table for vocabulary quiz games.
// Results are cached in Redis for 5 minutes to reduce database load.
// Returns empty slice if no players have completed sessions for this game.
func (s *Service) GetLeaderboard(ctx context.Context, gameID int64) ([]model.LeaderboardEntry, error) {
	// Try to get from cache first
	cacheKey := fmt.Sprintf("leaderboard:%d", gameID)
	cachedData, err := s.redis.Get(ctx, cacheKey).Result()

	// Cache hit - return cached data
	// Note: redis.Nil is returned when key doesn't exist (cache miss), which is not an error
	if err == nil && cachedData != "" {
		var entries []model.LeaderboardEntry
		if err := json.Unmarshal([]byte(cachedData), &entries); err == nil {
			return entries, nil
		}
		// If unmarshal fails, continue to fetch from DB
	}
	// For cache miss (redis.Nil) or any other Redis error, continue to DB query

	// Cache miss or error - fetch from database
	// Use window functions with CTE for efficient ranking
	// Query the new vocab_game_sessions table
	query := `
		WITH user_best_scores AS (
			SELECT
				vgs.game_id,
				vgs.user_id,
				MAX(vgs.correct_answers) as best_score,
				MAX(vgs.finished_at) as last_played
			FROM vocab_game_sessions vgs
			WHERE vgs.game_id = $1
				AND vgs.finished_at IS NOT NULL  -- Only completed sessions
			GROUP BY vgs.game_id, vgs.user_id
		),
		ranked_scores AS (
			SELECT
				ubs.user_id,
				u.username,
				ubs.best_score,
				ubs.last_played,
				ROW_NUMBER() OVER (ORDER BY ubs.best_score DESC, ubs.last_played ASC) as rank
			FROM user_best_scores ubs
			JOIN users u ON ubs.user_id = u.id
			WHERE u.is_active = TRUE
		)
		SELECT rank, user_id, username, best_score as score, last_played as achieved_at
		FROM ranked_scores 
		WHERE rank <= 10
		ORDER BY rank ASC
	`

	rows, err := s.db.Query(ctx, query, gameID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []model.LeaderboardEntry
	for rows.Next() {
		var entry model.LeaderboardEntry
		err := rows.Scan(
			&entry.Rank,
			&entry.UserID,
			&entry.Username,
			&entry.Score,
			&entry.AchievedAt,
		)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	// Return empty slice instead of nil if no entries found
	if entries == nil {
		entries = []model.LeaderboardEntry{}
	}

	// Cache the result in Redis with 5-minute TTL
	if jsonData, err := json.Marshal(entries); err == nil {
		// Set with 5-minute expiration (300 seconds)
		// Ignore cache set errors - not critical for functionality
		_ = s.redis.Set(ctx, cacheKey, jsonData, 5*time.Minute).Err()
	}

	return entries, nil
}

// GetGameByCode retrieves a game by its code.
// Returns the game if found and active, or an error if not found.
// This is used for routing and Coming Soon page display.
func (s *Service) GetGameByCode(ctx context.Context, code string) (*model.Game, error) {
	query := `
		SELECT 
			id, 
			code, 
			name, 
			description, 
			icon_path, 
			category, 
			display_order, 
			is_active, 
			created_at, 
			updated_at
		FROM games
		WHERE code = $1 AND is_active = TRUE
		LIMIT 1
	`

	var game model.Game
	err := s.db.QueryRow(ctx, query, code).Scan(
		&game.ID,
		&game.Code,
		&game.Name,
		&game.Description,
		&game.IconPath,
		&game.Category,
		&game.DisplayOrder,
		&game.IsActive,
		&game.CreatedAt,
		&game.UpdatedAt,
	)

	if err != nil {
		// Return nil and error if game not found or other database error
		return nil, err
	}

	return &game, nil
}
