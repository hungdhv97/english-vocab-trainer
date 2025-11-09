package example

import (
	"github.com/gin-gonic/gin"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/example/handler"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/example/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
)

// RegisterRoutes wires example handlers to the router.
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
	svc := service.New(d.PG)
	h := handler.New(svc)
	r.GET("/examples/word/:word_id", h.GetByWord)
	r.GET("/examples/level/:level_id", h.GetByLevel)
}

