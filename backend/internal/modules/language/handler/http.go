package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	lngservice "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/language/service"
)

// Handler provides HTTP handlers for language endpoints.
type Handler struct {
	svc *lngservice.Service
}

// New creates a new language handler.
func New(s *lngservice.Service) *Handler {
	return &Handler{svc: s}
}

// List returns all languages.
func (h *Handler) List(c *gin.Context) {
	languages, err := h.svc.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"languages": languages})
}

