package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gemini-demo-apps/vocab-app/internal/service"
	"github.com/gorilla/mux"
)

// levelWordCount maps level to number of words returned.
var levelWordCount = map[int]int{
	1: 5,
	2: 10,
	3: 15,
	4: 20,
	5: 25,
	6: 30,
}

// Handler handles HTTP requests.
type Handler struct {
	svc service.Service
}

// NewHandler creates a new Handler.
func NewHandler(s service.Service) *Handler {
	return &Handler{svc: s}
}

// GetRandomWords returns a random list of English words for a given level.
func (h *Handler) GetRandomWords(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	levelStr := r.URL.Query().Get("level")
	level, err := strconv.Atoi(levelStr)
	if err != nil || level < 1 {
		http.Error(w, "invalid level", http.StatusBadRequest)
		return
	}
	limit, ok := levelWordCount[level]
	if !ok {
		http.Error(w, "unknown level", http.StatusBadRequest)
		return
	}
	words, err := h.svc.GetRandomWords(level, limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	res := make([]string, len(words))
	for i, word := range words {
		res[i] = word.English
	}
	json.NewEncoder(w).Encode(res)
}

// GetTranslation returns the Vietnamese translation for an English word.
func (h *Handler) GetTranslation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	english := r.URL.Query().Get("word")
	if english == "" {
		http.Error(w, "missing word", http.StatusBadRequest)
		return
	}
	word, err := h.svc.GetWordByEnglish(english)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(struct {
		Vietnamese string `json:"vietnamese"`
	}{Vietnamese: word.Vietnamese})
}

// RegisterRoutes registers HTTP routes.
func (h *Handler) RegisterRoutes(r *mux.Router) {
	api := r.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/words", h.GetRandomWords).Methods("GET")
	api.HandleFunc("/translate", h.GetTranslation).Methods("GET")
}
