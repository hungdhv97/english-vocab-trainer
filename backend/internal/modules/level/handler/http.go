package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	lvlservice "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/level/service"
)

// Handler provides HTTP handlers for level endpoints.
type Handler struct {
	svc *lvlservice.Service
}

// New creates a new level handler.
func New(s *lvlservice.Service) *Handler {
	return &Handler{svc: s}
}

// List returns all available levels.
func (h *Handler) List(c *gin.Context) {
	levels, err := h.svc.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, levels)
}
