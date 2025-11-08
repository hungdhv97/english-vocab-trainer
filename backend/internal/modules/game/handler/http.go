package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/game/model"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/game/service"
	"github.com/jackc/pgx/v5"
)

// Handler handles HTTP requests for game endpoints.
type Handler struct {
	service *service.Service
}

// NewHandler creates a new game handler instance.
// Accepts a game service for business logic operations.
func NewHandler(svc *service.Service) *Handler {
	return &Handler{
		service: svc,
	}
}

// ListGames handles GET /api/v1/games - returns all active games.
// Returns HTTP 200 with JSON array of games, or HTTP 500 on error.
// This is a public endpoint (no authentication required).
func (h *Handler) ListGames(c *gin.Context) {
	games, err := h.service.ListActiveGames(c.Request.Context())
	if err != nil {
		c.JSON(500, gin.H{
			"error":   "Internal server error",
			"message": "Failed to retrieve games",
		})
		return
	}

	c.JSON(200, gin.H{
		"games": games,
	})
}

// GetLeaderboard handles GET /api/v1/games/:id/leaderboard - returns top 10 players.
// Returns HTTP 200 with leaderboard array (may be empty), or HTTP 400/404/500 on error.
// This is a public endpoint (no authentication required).
func (h *Handler) GetLeaderboard(c *gin.Context) {
	// Parse game ID from URL parameter
	gameIDStr := c.Param("id")
	gameID, err := strconv.ParseInt(gameIDStr, 10, 64)
	if err != nil {
		c.JSON(400, gin.H{
			"error":   "Invalid game ID",
			"message": "Game ID must be a valid integer",
		})
		return
	}

	// Fetch leaderboard from service
	entries, err := h.service.GetLeaderboard(c.Request.Context(), gameID)
	if err != nil {
		c.JSON(500, gin.H{
			"error":   "Internal server error",
			"message": "Failed to retrieve leaderboard",
			"details": err.Error(),
		})
		return
	}

	// Always return a valid response, even if leaderboard is empty
	if entries == nil {
		entries = []model.LeaderboardEntry{}
	}

	// Return the leaderboard
	c.JSON(200, gin.H{
		"game_id":     gameID,
		"leaderboard": entries,
	})
}

// GetGameByCode handles GET /api/v1/games/code/:code - returns game information by code.
// Returns HTTP 200 with game object, HTTP 404 if game not found, or HTTP 500 on error.
// This is a public endpoint (no authentication required).
func (h *Handler) GetGameByCode(c *gin.Context) {
	// Get game code from URL parameter
	code := c.Param("code")
	if code == "" {
		c.JSON(400, gin.H{
			"error":   "Invalid game code",
			"message": "Game code is required",
		})
		return
	}

	// Fetch game from service
	game, err := h.service.GetGameByCode(c.Request.Context(), code)
	if err != nil {
		// Check if game not found (pgx.ErrNoRows)
		if err == pgx.ErrNoRows {
			c.JSON(404, gin.H{
				"error":   "Game not found",
				"message": "No game found with code: " + code,
			})
			return
		}

		// Other database errors
		c.JSON(500, gin.H{
			"error":   "Internal server error",
			"message": "Failed to retrieve game",
			"details": err.Error(),
		})
		return
	}

	// Return the game
	c.JSON(200, gin.H{
		"game": game,
	})
}
