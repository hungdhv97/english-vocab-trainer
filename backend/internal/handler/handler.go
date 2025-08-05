package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/gemini-demo-apps/vocab-app/internal/models"
	"github.com/gemini-demo-apps/vocab-app/internal/service"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

// Handler provides HTTP handlers for the API.
type Handler struct {
	svc *service.Service
}

// NewHandler returns a new Handler.
func NewHandler(s *service.Service) *Handler {
	return &Handler{svc: s}
}

// RegisterRoutes registers API routes.
func (h *Handler) RegisterRoutes(r *mux.Router) {
	api := r.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/register", h.Register).Methods("POST")
	api.HandleFunc("/login", h.Login).Methods("POST")
	api.HandleFunc("/history/{userID}", h.History).Methods("GET")
	api.HandleFunc("/words/random", h.RandomWords).Methods("GET")
	api.HandleFunc("/answer", h.Answer).Methods("POST")
	api.HandleFunc("/session", h.Session).Methods("POST")
}

// Register handles user registration.
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	user, err := h.svc.RegisterUser(req.Username, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	json.NewEncoder(w).Encode(user)
}

// Login handles user authentication.
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	user, err := h.svc.Authenticate(req.Username, req.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}
	json.NewEncoder(w).Encode(user)
}

// History returns play history for a user.
func (h *Handler) History(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	userIDStr := mux.Vars(r)["userID"]
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		http.Error(w, "invalid user id", http.StatusBadRequest)
		return
	}
	plays, err := h.svc.GetHistory(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(plays)
}

// RandomWords returns random words based on query parameters.
func (h *Handler) RandomWords(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	countStr := r.URL.Query().Get("count")
	language := r.URL.Query().Get("language")
	difficulty := r.URL.Query().Get("difficulty")
	count, err := strconv.Atoi(countStr)
	if err != nil || count <= 0 {
		http.Error(w, "invalid count", http.StatusBadRequest)
		return
	}
	words, err := h.svc.GetRandomWords(count, language, difficulty)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	json.NewEncoder(w).Encode(words)
}

// Answer handles recording an answer and returning the correct translation.
func (h *Handler) Answer(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		WordID       int64  `json:"word_id"`
		UserID       int64  `json:"user_id"`
		LanguageCode string `json:"language_code"`
		ResponseTime int    `json:"response_time"`
		UserAnswer   string `json:"user_answer"`
		EarnedScore  int    `json:"earned_score"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	cookie, err := r.Cookie("session_tag")
	if err != nil {
		http.Error(w, "missing session_tag", http.StatusBadRequest)
		return
	}
	correct, err := h.svc.GetTranslation(req.WordID, req.LanguageCode)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
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
	play.SessionTag, _ = uuid.Parse(cookie.Value)
	if _, err := h.svc.RecordPlay(play); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"correct_answer": correct,
		"is_correct":     isCorrect,
	})
}

// Session creates a new session tag cookie.
func (h *Handler) Session(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tag := h.svc.CreateSession()
	http.SetCookie(w, &http.Cookie{
		Name:     "session_tag",
		Value:    tag.String(),
		Path:     "/",
		HttpOnly: true,
	})
	json.NewEncoder(w).Encode(map[string]string{"session_tag": tag.String()})
}
