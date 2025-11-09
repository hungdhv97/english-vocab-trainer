package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	transservice "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/translation/service"
)

// Handler provides HTTP handlers for translation endpoints.
type Handler struct {
	svc *transservice.Service
}

// New creates a new translation handler.
func New(s *transservice.Service) *Handler {
	return &Handler{svc: s}
}

// GetByWord returns all translations for a word.
func (h *Handler) GetByWord(c *gin.Context) {
	wordIDStr := c.Param("word_id")
	wordID, err := strconv.ParseInt(wordIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid word_id"})
		return
	}

	translations, err := h.svc.GetByWord(wordID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"translations": translations})
}

// GetByLevel returns all translations for a specific CEFR level.
func (h *Handler) GetByLevel(c *gin.Context) {
	levelIDStr := c.Param("level_id")
	levelID, err := strconv.ParseInt(levelIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid level_id"})
		return
	}

	translations, err := h.svc.GetByLevel(levelID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"translations": translations})
}

