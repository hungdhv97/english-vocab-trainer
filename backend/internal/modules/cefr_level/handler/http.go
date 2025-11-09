package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	cefrservice "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/cefr_level/service"
)

// Handler provides HTTP handlers for CEFR level endpoints.
type Handler struct {
	svc *cefrservice.Service
}

// New creates a new CEFR level handler.
func New(s *cefrservice.Service) *Handler {
	return &Handler{svc: s}
}

// List returns all CEFR levels.
func (h *Handler) List(c *gin.Context) {
	levels, err := h.svc.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"levels": levels})
}

// GetByCode returns a CEFR level by its code.
func (h *Handler) GetByCode(c *gin.Context) {
	code := c.Param("code")
	level, err := h.svc.GetByCode(code)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "CEFR level not found"})
		return
	}
	c.JSON(http.StatusOK, level)
}

