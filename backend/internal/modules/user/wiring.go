package user

import (
	"github.com/gin-gonic/gin"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/user/handler"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/user/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
)

// RegisterRoutes wires user handlers to the router.
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
	svc := service.New(d.PG)
	h := handler.New(svc)
	r.POST("/register", h.Register)
	r.POST("/login", h.Login)
}
