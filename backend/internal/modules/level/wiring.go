package level

import (
	"github.com/gin-gonic/gin"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/level/handler"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/level/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
)

// RegisterRoutes wires level handlers to the router.
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
	svc := service.New(d.PG)
	h := handler.New(svc)
	r.GET("/levels", h.List)
}
