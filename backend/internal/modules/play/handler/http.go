package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/play/dto"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/play/model"
	playsvc "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/play/service"
	wordsvc "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/word/service"
)

// Handler provides HTTP handlers for play endpoints.
type Handler struct {
	svc      *playsvc.Service
	words    *wordsvc.Service
	validate *validator.Validate
}

// New creates a new play handler.
func New(s *playsvc.Service, w *wordsvc.Service) *Handler {
	return &Handler{svc: s, words: w, validate: validator.New()}
}

// History returns play history for a user.
func (h *Handler) History(c *gin.Context) {
	userID, err := strconv.ParseInt(c.Param("userID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	plays, err := h.svc.GetHistory(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, plays)
}

// Answer handles recording an answer and returning the correct translation.
func (h *Handler) Answer(c *gin.Context) {
	var req dto.AnswerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.validate.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	cookie, err := c.Request.Cookie("session_tag")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing session_tag"})
		return
	}
	correct, err := h.words.GetMeaning(req.WordID, req.LanguageCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	isCorrect := req.UserAnswer != "" && strings.EqualFold(req.UserAnswer, correct)
	play := model.Play{
		UserID:       req.UserID,
		WordID:       req.WordID,
		UserAnswer:   req.UserAnswer,
		IsCorrect:    isCorrect,
		ResponseTime: req.ResponseTime,
		EarnedScore:  req.EarnedScore,
	}
	if tag, err := uuid.Parse(cookie.Value); err == nil {
		play.SessionTag = tag
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session_tag"})
		return
	}
	if _, err := h.svc.RecordPlay(play); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"correct_answer": correct,
		"is_correct":     isCorrect,
	})
}

// Session creates a new session tag cookie.
func (h *Handler) Session(c *gin.Context) {
	tag := h.svc.CreateSession()
	cookie := &http.Cookie{
		Name:     "session_tag",
		Value:    tag.String(),
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode,
	}
	if c.Request.TLS != nil {
		cookie.Secure = true
	}
	http.SetCookie(c.Writer, cookie)
	c.JSON(http.StatusOK, gin.H{"session_tag": tag.String()})
}
