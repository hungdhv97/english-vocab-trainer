package handler

import (
	"net/http"
	"os"
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
	lang := c.DefaultQuery("language", "vi")
	for i := range plays {
		if ans, err := h.words.GetMeaning(plays[i].Word.ID, lang); err == nil {
			plays[i].CorrectAnswer = ans
		}
	}
	c.JSON(http.StatusOK, plays)
}

// Answer handles recording an answer and returning the correct translation.
// Updated to support new schema with translation_id and correct_answer (T056).
func (h *Handler) Answer(c *gin.Context) {
	var req dto.AnswerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Validate: Either language_code (old schema) or translation_id + correct_answer (new schema) must be provided
	if req.LanguageCode == "" && (req.TranslationID == nil || req.CorrectAnswer == "") {
		// Try to get correct answer from translation_id if provided
		if req.TranslationID != nil {
			// New schema: Get correct answer from translation
			// This will be handled by the service, but we need to validate the answer format
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "either language_code or translation_id with correct_answer is required"})
			return
		}
	}
	
	cookie, err := c.Request.Cookie("session_tag")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing session_tag"})
		return
	}
	
	var correct string
	var isCorrect bool
	
	// Use new schema if translation_id and correct_answer are provided
	if req.TranslationID != nil && req.CorrectAnswer != "" {
		// New schema: Use provided correct_answer
		correct = req.CorrectAnswer
		isCorrect = req.UserAnswer != "" && strings.EqualFold(req.UserAnswer, correct)
	} else {
		// Old schema: Get correct answer from word service
		correct, err = h.words.GetMeaning(req.WordID, req.LanguageCode)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		isCorrect = req.UserAnswer != "" && strings.EqualFold(req.UserAnswer, correct)
	}
	
	play := model.Play{
		UserID:     req.UserID,
		WordID:     req.WordID,
		UserAnswer: req.UserAnswer,
		IsCorrect:  isCorrect,
	}
	
	// Set translation_id and correct_answer if provided (new schema)
	if req.TranslationID != nil {
		play.TranslationID = req.TranslationID
	}
	if req.CorrectAnswer != "" {
		play.CorrectAnswer = req.CorrectAnswer
	}
	
	if tag, err := uuid.Parse(cookie.Value); err == nil {
		play.SessionTag = tag
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session_tag"})
		return
	}
	
	pRec, total, err := h.svc.RecordPlay(play)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// Build response with translation_id if available (T056)
	response := gin.H{
		"correct_answer": correct,
		"is_correct":     isCorrect,
		"score":          pRec.Score,
		"target":         pRec.Target,
		"total_score":    total,
	}
	
	// Add translation_id to response if available (new schema)
	if pRec.TranslationID != nil {
		response["translation_id"] = *pRec.TranslationID
	}
	
	c.JSON(http.StatusOK, response)
}

// Finish marks the current session as finished.
func (h *Handler) Finish(c *gin.Context) {
	cookie, err := c.Request.Cookie("session_tag")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing session_tag"})
		return
	}
	tag, err := uuid.Parse(cookie.Value)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session_tag"})
		return
	}
	if err := h.svc.FinishSession(tag); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "finished"})
}

// Session creates a new session tag cookie.
// Updated to support both old schema (level_id) and new schema (cefr_level_id, translation_direction) (T055).
func (h *Handler) Session(c *gin.Context) {
	var req dto.SessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Validate: Either level_id (old schema) or cefr_level_id (new schema) must be provided
	if req.LevelID == 0 && (req.CefrLevelID == nil || *req.CefrLevelID == 0) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "either level_id or cefr_level_id is required"})
		return
	}
	
	var tag uuid.UUID
	var err error
	
	// Use new schema if cefr_level_id is provided
	if req.CefrLevelID != nil && *req.CefrLevelID > 0 {
		// For new schema, try to get game_id from level_id if available (for backward compatibility)
		// If level_id is not provided or game_id cannot be found, pass 0 (will insert NULL)
		var gameID int64
		if req.LevelID > 0 {
			// Try to get game_id from level_id via game_levels
			ctx := c.Request.Context()
			if foundGameID, err := h.svc.GetGameIDFromLevelID(ctx, req.LevelID); err == nil {
				gameID = foundGameID
			}
		}
		tag, err = h.svc.CreateSessionWithDirection(req.UserID, gameID, req.LevelID, *req.CefrLevelID, req.TranslationDirection)
	} else {
		// Old schema: Use level_id
		tag, err = h.svc.CreateSession(req.UserID, req.LevelID)
	}
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// Determine cookie settings based on environment
	// In development (HTTP on localhost): Use None mode without Secure (browsers allow this for localhost)
	// In production (HTTPS): Use None mode with Secure (required for cross-site cookies)
	isDev := isDevelopmentMode()
	cookie := &http.Cookie{
		Name:     "session_tag",
		Value:    tag.String(),
		Path:     "/",
		HttpOnly: true,
	}
	
	if isDev {
		// Development: Use Lax mode since we're using Vite proxy for same-origin requests
		// Vite proxy makes API requests appear same-origin, so Lax works perfectly
		// This is more reliable than SameSite=None without Secure
		cookie.SameSite = http.SameSiteLaxMode
		cookie.Secure = false
	} else {
		// Production: Use None with Secure for cross-site cookies on HTTPS
		cookie.SameSite = http.SameSiteNoneMode
		cookie.Secure = true
	}
	
	http.SetCookie(c.Writer, cookie)
	c.JSON(http.StatusOK, gin.H{"session_tag": tag.String()})
}

// isDevelopmentMode checks if the application is running in development mode
func isDevelopmentMode() bool {
	env := os.Getenv("APP_ENV")
	return env == "development" || env == "dev" || env == ""
}
