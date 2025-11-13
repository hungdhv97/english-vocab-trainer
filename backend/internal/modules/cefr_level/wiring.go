package cefrlevel

import (
	"github.com/gin-gonic/gin"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/cefr_level/handler"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/cefr_level/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
)

// RegisterRoutes wires CEFR level handlers to the router.
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
	svc := service.New(d.PG)
	h := handler.New(svc)
	r.GET("/cefr-levels", h.List)
	r.GET("/cefr-levels/:code", h.GetByCode)
}
