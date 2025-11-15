package handler

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/vocab_quiz/model"
	vocabquizservice "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/vocab_quiz/service"
)

// Handler provides HTTP handlers for vocab quiz endpoints.
type Handler struct {
	svc *vocabquizservice.Service
}

// New creates a new vocab quiz handler.
func New(s *vocabquizservice.Service) *Handler {
	return &Handler{svc: s}
}

// CreateSession creates a new vocab quiz session with questions (T084).
func (h *Handler) CreateSession(c *gin.Context) {
	var req model.CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default question count to 20 if not provided
	if req.QuestionCount == 0 {
		req.QuestionCount = 20
	}

	// Create session and generate questions
	ctx := c.Request.Context()
	sessionID, questions, err := h.svc.CreateSessionAndQuestions(
		ctx,
		req.UserID,
		req.GameID,
		req.CefrLevelID,
		req.TranslationDirection,
		req.QuestionCount,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Set session ID in cookie for convenience (though frontend should use session_id from response)
	isDev := isDevelopmentMode()
	cookie := &http.Cookie{
		Name:     "session_id",
		Value:    strconv.FormatInt(sessionID, 10),
		Path:     "/",
		HttpOnly: true,
	}

	if isDev {
		cookie.SameSite = http.SameSiteLaxMode
		cookie.Secure = false
	} else {
		cookie.SameSite = http.SameSiteNoneMode
		cookie.Secure = true
	}

	http.SetCookie(c.Writer, cookie)
	c.JSON(http.StatusOK, model.CreateSessionResponse{
		SessionID: sessionID,
		Questions: questions,
	})
}

// SubmitAnswer submits an answer for a question (T086).
func (h *Handler) SubmitAnswer(c *gin.Context) {
	var req model.AnswerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate required fields
	if req.SessionQuestionID == 0 || req.ChosenOption == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "session_question_id and chosen_option are required"})
		return
	}

	// Submit answer
	ctx := c.Request.Context()
	isCorrect, err := h.svc.SubmitAnswer(ctx, req.SessionQuestionID, req.ChosenOption)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get session statistics to return current counts
	// We need to get the session ID from the question
	session, err := h.svc.GetSessionByQuestionID(ctx, req.SessionQuestionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get session"})
		return
	}

	// Get updated session statistics
	stats, err := h.svc.GetSessionStatistics(ctx, session.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get statistics"})
		return
	}

	c.JSON(http.StatusOK, model.AnswerResponse{
		IsCorrect:    isCorrect,
		CorrectCount: stats.CorrectCount,
		TotalCount:   stats.CorrectCount + stats.IncorrectCount,
	})
}

// FinishSession marks the session as finished and returns statistics.
func (h *Handler) FinishSession(c *gin.Context) {
	sessionIDStr := c.Param("sessionId")
	sessionID, err := strconv.ParseInt(sessionIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session_id"})
		return
	}

	ctx := c.Request.Context()
	// Finish session
	err = h.svc.FinishSession(ctx, sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get session statistics
	stats, err := h.svc.GetSessionStatistics(ctx, sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetSessionStatistics retrieves statistics for a session.
func (h *Handler) GetSessionStatistics(c *gin.Context) {
	sessionIDStr := c.Param("sessionId")
	sessionID, err := strconv.ParseInt(sessionIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session_id"})
		return
	}

	ctx := c.Request.Context()
	stats, err := h.svc.GetSessionStatistics(ctx, sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetSessionDetails retrieves comprehensive session details including statistics, questions, and answers.
// TODO: Replace user_id query parameter with authentication middleware when JWT auth is implemented.
func (h *Handler) GetSessionDetails(c *gin.Context) {
	sessionIDStr := c.Param("sessionId")
	sessionID, err := strconv.ParseInt(sessionIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid session_id"})
		return
	}

	// Get user_id from query parameter (temporary - should come from auth middleware)
	userIDStr := c.Query("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	ctx := c.Request.Context()
	details, err := h.svc.GetSessionDetails(ctx, sessionID, userID)
	if err != nil {
		errMsg := err.Error()
		// Check if error is authorization error
		if errMsg == "unauthorized: session does not belong to user" {
			c.JSON(http.StatusForbidden, gin.H{"error": "unauthorized: session does not belong to user"})
			return
		}
		// Check if error indicates session not found (check for pgx.ErrNoRows in error chain)
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "session not found"})
			return
		}
		// Generic error handling
		c.JSON(http.StatusInternalServerError, gin.H{"error": errMsg})
		return
	}

	c.JSON(http.StatusOK, details)
}

// GetWordDetail retrieves comprehensive word information.
func (h *Handler) GetWordDetail(c *gin.Context) {
	wordIDStr := c.Param("wordId")
	wordID, err := strconv.ParseInt(wordIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid word_id"})
		return
	}

	ctx := c.Request.Context()
	wordDetail, err := h.svc.GetWordDetail(ctx, wordID)
	if err != nil {
		errMsg := err.Error()
		// Check if error indicates word not found
		if errMsg == "word not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "word not found"})
			return
		}
		// Generic error handling
		c.JSON(http.StatusInternalServerError, gin.H{"error": errMsg})
		return
	}

	c.JSON(http.StatusOK, wordDetail)
}

// GenerateQuestions generates multiple-choice questions for a vocabulary quiz (for backward compatibility).
// Note: In the new flow, questions are generated when creating a session via CreateSession.
func (h *Handler) GenerateQuestions(c *gin.Context) {
	var req model.QuestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default count to 20 if not provided
	if req.Count == 0 {
		req.Count = 20
	}

	// Determine source and target languages based on translation direction
	var fromLangCode, toLangCode string
	if req.TranslationDirection == "en-to-vi" {
		fromLangCode = "en"
		toLangCode = "vi"
	} else if req.TranslationDirection == "vi-to-en" {
		fromLangCode = "vi"
		toLangCode = "en"
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid translation direction"})
		return
	}

	// Get CEFR level to determine which levels to include
	ctx := c.Request.Context()
	cefrLevel, err := h.svc.GetCefrLevelByID(ctx, req.CefrLevelID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("invalid CEFR level: %v", err)})
		return
	}

	// Get all levels up to and including the selected level (hierarchical inclusion)
	levels, err := h.svc.GetCefrLevelsUpTo(ctx, cefrLevel.Code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to get levels: %v", err)})
		return
	}

	if len(levels) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no CEFR levels found"})
		return
	}

	// Extract level IDs
	levelIDs := make([]int64, len(levels))
	for i, level := range levels {
		levelIDs[i] = level.ID
	}

	// Generate questions
	questions, _, err := h.svc.GenerateQuestionsWithTranslations(ctx, fromLangCode, toLangCode, levelIDs, req.Count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"questions": questions})
}

// GetLeaderboard handles GET /vocab-quiz/leaderboard - returns top 10 players for a CEFR level and translation direction.
// Query parameters: game_id, cefr_level_id, translation_direction
// Returns HTTP 200 with leaderboard array (may be empty), or HTTP 400/500 on error.
// This is a public endpoint (no authentication required).
func (h *Handler) GetLeaderboard(c *gin.Context) {
	// Parse query parameters
	gameIDStr := c.Query("game_id")
	if gameIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "game_id is required"})
		return
	}
	gameID, err := strconv.ParseInt(gameIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid game_id"})
		return
	}

	cefrLevelIDStr := c.Query("cefr_level_id")
	if cefrLevelIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cefr_level_id is required"})
		return
	}
	cefrLevelID, err := strconv.ParseInt(cefrLevelIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid cefr_level_id"})
		return
	}

	translationDirection := c.Query("translation_direction")
	if translationDirection == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "translation_direction is required"})
		return
	}
	if translationDirection != "en-to-vi" && translationDirection != "vi-to-en" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "translation_direction must be 'en-to-vi' or 'vi-to-en'"})
		return
	}

	// Fetch leaderboard from service
	ctx := c.Request.Context()
	entries, cefrLevelCode, minGamesPlayed, err := h.svc.GetLeaderboard(ctx, gameID, cefrLevelID, translationDirection)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Always return a valid response, even if leaderboard is empty
	if entries == nil {
		entries = []model.LeaderboardEntry{}
	}

	// Return the leaderboard
	c.JSON(http.StatusOK, model.LeaderboardResponse{
		GameID:             gameID,
		CefrLevelID:        cefrLevelID,
		CefrLevelCode:      cefrLevelCode,
		TranslationDirection: translationDirection,
		MinGamesPlayed:     minGamesPlayed,
		Leaderboard:        entries,
	})
}

// isDevelopmentMode checks if the application is running in development mode
func isDevelopmentMode() bool {
	env := os.Getenv("APP_ENV")
	return env == "development" || env == "dev" || env == ""
}
