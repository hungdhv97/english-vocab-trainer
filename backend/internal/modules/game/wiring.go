package game

import (
	"github.com/gin-gonic/gin"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/game/handler"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/game/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
)

// RegisterRoutes wires game handlers to the router.
// All game endpoints are public (no authentication middleware required).
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
	svc := service.NewService(d.PG, d.RDB)
	h := handler.NewHandler(svc)

	// Public endpoints - no authentication required
	r.GET("/games", h.ListGames)
	r.GET("/games/:id/leaderboard", h.GetLeaderboard)
}

