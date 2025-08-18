package word

import (
	"github.com/gin-gonic/gin"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/word/handler"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/word/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
)

// RegisterRoutes wires word handlers to the router.
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
	svc := service.New(d.PG, d.RDB, d.Cfg.Cursor.Secret, d.Translator)
	h := handler.New(svc)
	r.GET("/words/random", h.RandomWords)
}
