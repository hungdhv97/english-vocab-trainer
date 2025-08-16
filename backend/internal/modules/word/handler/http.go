package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/word/service"
)

// Handler provides HTTP handlers for word endpoints.
type Handler struct {
	svc *service.Service
}

// New creates a new word handler.
func New(s *service.Service) *Handler {
	return &Handler{svc: s}
}

// RandomWords returns random words based on query parameters.
func (h *Handler) RandomWords(c *gin.Context) {
	countStr := c.Query("count")
	language := c.Query("language")
	difficulty := c.Query("difficulty")
	count, err := strconv.Atoi(countStr)
	if err != nil || count <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid count"})
		return
	}
	words, err := h.svc.GetRandomWords(count, language, difficulty)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, words)
}
