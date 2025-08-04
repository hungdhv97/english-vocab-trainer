package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gemini-demo-apps/vocab-app/internal/handler"
	"github.com/gemini-demo-apps/vocab-app/internal/service"
	"github.com/gemini-demo-apps/vocab-app/internal/models"

	"github.com/gorilla/mux"
)

// In a real application, you would connect to a database here.
// For now, we'll use a simple in-memory store for demonstration.
type inMemoryWordRepository struct {
	words []models.Word
}

func (r *inMemoryWordRepository) GetAllWords() ([]models.Word, error) {
	return r.words, nil
}

func (r *inMemoryWordRepository) CreateWord(word models.Word) (models.Word, error) {
	// Assign a simple ID for in-memory store
	if word.ID == 0 {
		word.ID = int64(len(r.words) + 1)
	}
	r.words = append(r.words, word)
	return word, nil
}

func (r *inMemoryWordRepository) UpdateWord(word models.Word) (models.Word, error) {
	for i, w := range r.words {
		if w.ID == word.ID {
			r.words[i] = word
			return word, nil
		}
	}
	return models.Word{}, fmt.Errorf("word with ID %d not found", word.ID)
}

func (r *inMemoryWordRepository) DeleteWord(id int64) error {
	for i, w := range r.words {
		if w.ID == id {
			r.words = append(r.words[:i], r.words[i+1:]...)
			return nil
		}
	}
	return fmt.Errorf("word with ID %d not found", id)
}

func main() {
	// Initialize in-memory repository (replace with actual DB connection in production)
	repo := &inMemoryWordRepository{words: []models.Word{}}

	// Initialize service and handler
	svc := service.NewService(repo)
	hdl := handler.NewHandler(svc)

	r := mux.NewRouter()

	// Register API routes
	hdl.RegisterRoutes(r)

	// Add CORS middleware
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*") // Allow all origins for development
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}