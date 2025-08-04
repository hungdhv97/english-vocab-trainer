package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gemini-demo-apps/vocab-app/internal/models"
	"github.com/gemini-demo-apps/vocab-app/internal/service"

	"github.com/gorilla/mux"
)

// Handler is the HTTP handler layer.
type Handler struct {
	service service.Service
}

// NewHandler creates a new Handler.
func NewHandler(s service.Service) *Handler {
	return &Handler{service: s}
}

// GetWords handles fetching all words.
func (h *Handler) GetWords(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	words, err := h.service.GetAllWords()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(words)
}

// CreateWord handles creating a new word.
func (h *Handler) CreateWord(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var word models.Word
	err := json.NewDecoder(r.Body).Decode(&word)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	createdWord, err := h.service.CreateWord(word.English, word.Vietnamese, word.Example)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(createdWord)
}

// UpdateWord handles updating an existing word.
func (h *Handler) UpdateWord(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid word ID", http.StatusBadRequest)
		return
	}

	var word models.Word
	err = json.NewDecoder(r.Body).Decode(&word)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Ensure the ID from the URL matches the ID in the request body (if provided)
	if word.ID == 0 {
		word.ID = id
	} else if word.ID != id {
		http.Error(w, "ID in URL and body do not match", http.StatusBadRequest)
		return
	}

	updatedWord, err := h.service.UpdateWord(word.ID, word.English, word.Vietnamese, word.Example)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(updatedWord)
}

// DeleteWord handles deleting a word.
func (h *Handler) DeleteWord(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid word ID", http.StatusBadRequest)
		return
	}

	err = h.service.DeleteWord(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent) // 204 No Content for successful deletion
}

// RegisterRoutes registers the HTTP routes.
func (h *Handler) RegisterRoutes(r *mux.Router) {
	api := r.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/words", h.GetWords).Methods("GET")
	api.HandleFunc("/words", h.CreateWord).Methods("POST")
	api.HandleFunc("/words/{id}", h.UpdateWord).Methods("PUT")
	api.HandleFunc("/words/{id}", h.DeleteWord).Methods("DELETE")
}