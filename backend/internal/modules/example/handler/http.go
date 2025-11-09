package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	exampleservice "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/example/service"
)

// Handler provides HTTP handlers for example endpoints.
type Handler struct {
	svc *exampleservice.Service
}

// New creates a new example handler.
func New(s *exampleservice.Service) *Handler {
	return &Handler{svc: s}
}

// GetByWord returns all examples for a word.
func (h *Handler) GetByWord(c *gin.Context) {
	wordIDStr := c.Param("word_id")
	wordID, err := strconv.ParseInt(wordIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid word_id"})
		return
	}

	examples, err := h.svc.GetByWord(wordID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"examples": examples})
}

// GetByLevel returns all examples for a specific CEFR level.
func (h *Handler) GetByLevel(c *gin.Context) {
	levelIDStr := c.Param("level_id")
	levelID, err := strconv.ParseInt(levelIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid level_id"})
		return
	}

	examples, err := h.svc.GetByLevel(levelID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"examples": examples})
}

