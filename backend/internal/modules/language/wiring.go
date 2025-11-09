package language

import (
	"github.com/gin-gonic/gin"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/language/handler"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/language/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
)

// RegisterRoutes wires language handlers to the router.
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
	svc := service.New(d.PG)
	h := handler.New(svc)
	r.GET("/languages", h.List)
}

