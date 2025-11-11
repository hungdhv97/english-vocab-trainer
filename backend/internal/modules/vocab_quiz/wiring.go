package vocab_quiz

import (
	"github.com/gin-gonic/gin"

	cefrservice "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/cefr_level/service"
	transservice "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/translation/service"
	vocabgamesvc "github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/vocab_game/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/vocab_quiz/handler"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/vocab_quiz/service"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
)

// RegisterRoutes wires vocab quiz handlers to the router.
func RegisterRoutes(r *gin.RouterGroup, d *deps.Deps) {
	cefrLevelSvc := cefrservice.New(d.PG)
	translationSvc := transservice.New(d.PG)
	vocabGameSvc := vocabgamesvc.New(d.PG)
	minGamesPlayed := d.Cfg.Leaderboard.MinGamesPlayed
	if minGamesPlayed <= 0 {
		minGamesPlayed = 1 // Default to 1 if not configured
	}
	svc := service.New(d.PG, cefrLevelSvc, translationSvc, vocabGameSvc, minGamesPlayed)
	h := handler.New(svc)

	// Session management
	r.POST("/vocab-quiz/session", h.CreateSession)
	r.POST("/vocab-quiz/session/:sessionId/finish", h.FinishSession)
	r.GET("/vocab-quiz/session/:sessionId/statistics", h.GetSessionStatistics)
	r.GET("/vocab-quiz/session/:sessionId/details", h.GetSessionDetails)

	// Word details
	r.GET("/vocab-quiz/word/:wordId", h.GetWordDetail)

	// Answer submission
	r.POST("/vocab-quiz/answer", h.SubmitAnswer)
	
	// Question generation (for backward compatibility - questions are now included in session creation)
	r.POST("/vocab-quiz/questions", h.GenerateQuestions)

	// Leaderboard
	r.GET("/vocab-quiz/leaderboard", h.GetLeaderboard)
}
