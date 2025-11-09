package translation

import (
	"github.com/gin-gonic/gin"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/translation/handler"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/translation/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
)

// RegisterRoutes wires translation handlers to the router.
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
	svc := service.New(d.PG)
	h := handler.New(svc)
	r.GET("/translations/word/:word_id", h.GetByWord)
	r.GET("/translations/level/:level_id", h.GetByLevel)
}

