package play

import (
	"github.com/gin-gonic/gin"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/play/handler"
	playsvc "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/play/service"
	wordsvc "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/word/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
)

// RegisterRoutes wires play handlers to the router.
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
	wsvc := wordsvc.New(d.PG, d.RDB, d.Cfg.Cursor.Secret)
	svc := playsvc.New(d.PG)
	h := handler.New(svc, wsvc)
	r.GET("/history/:userID", h.History)
	r.POST("/answer", h.Answer)
	r.POST("/session", h.Session)
	r.POST("/finish", h.Finish)
}
