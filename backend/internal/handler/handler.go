package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/models"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/service"
)

// Handler provides HTTP handlers for the API.
type Handler struct {
	svc      *service.Service
	validate *validator.Validate
}

// NewHandler returns a new Handler.
func NewHandler(s *service.Service) *Handler {
	return &Handler{svc: s, validate: validator.New()}
}

// RegisterRoutes registers API routes.
func (h *Handler) RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	api.POST("/register", h.Register)
	api.POST("/login", h.Login)
	api.GET("/history/:userID", h.History)
	api.GET("/words/random", h.RandomWords)
	api.POST("/answer", h.Answer)
	api.POST("/session", h.Session)

	// Docs routes (outside of /api/v1)
	r.GET("/openapi.yaml", h.OpenAPISpec)
	r.GET("/docs", h.SwaggerUI)
}

type registerReq struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// Register handles user registration.
func (h *Handler) Register(c *gin.Context) {
	var req registerReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.validate.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, err := h.svc.RegisterUser(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}

type loginReq struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// Login handles user authentication.
func (h *Handler) Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.validate.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	user, err := h.svc.Authenticate(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
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

type answerReq struct {
	WordID       int64  `json:"word_id" validate:"required"`
	UserID       int64  `json:"user_id" validate:"required"`
	LanguageCode string `json:"language_code" validate:"required"`
	ResponseTime int    `json:"response_time" validate:"required"`
	UserAnswer   string `json:"user_answer"`
	EarnedScore  int    `json:"earned_score" validate:"required"`
}

// Answer handles recording an answer and returning the correct translation.
func (h *Handler) Answer(c *gin.Context) {
	var req answerReq
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
	correct, err := h.svc.GetTranslation(req.WordID, req.LanguageCode)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	isCorrect := req.UserAnswer != "" && strings.EqualFold(req.UserAnswer, correct)
	play := models.Play{
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

// OpenAPISpec serves the OpenAPI YAML spec.
func (h *Handler) OpenAPISpec(c *gin.Context) {
	c.File("docs/openapi.yaml")
}

// SwaggerUI serves a minimal Swagger UI HTML page that loads the local OpenAPI spec.
func (h *Handler) SwaggerUI(c *gin.Context) {
	html := `<!doctype html>
<html>
        <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <title>API Docs</title>
                <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
        </head>
        <body>
                <div id="swagger-ui"></div>
                <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
                <script>
                        window.onload = () => {
                                window.ui = SwaggerUIBundle({
                                        url: '/openapi.yaml',
                                        dom_id: '#swagger-ui',
                                        deepLinking: true,
                                        presets: [SwaggerUIBundle.presets.apis],
                                });
                        };
                </script>
        </body>
</html>`
	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
}
