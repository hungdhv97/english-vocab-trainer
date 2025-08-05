package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gemini-demo-apps/vocab-app/internal/db"
	"github.com/gemini-demo-apps/vocab-app/internal/handler"
	"github.com/gemini-demo-apps/vocab-app/internal/models"
	"github.com/gemini-demo-apps/vocab-app/internal/service"
	"github.com/gorilla/mux"
)

type pgWordRepository struct {
	db *sql.DB
}

func (r *pgWordRepository) GetRandomWords(level int, limit int) ([]models.Word, error) {
	rows, err := r.db.Query(`SELECT id, english, vietnamese, level FROM words WHERE level=$1 ORDER BY RANDOM() LIMIT $2`, level, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var words []models.Word
	for rows.Next() {
		var w models.Word
		if err := rows.Scan(&w.ID, &w.English, &w.Vietnamese, &w.Level); err != nil {
			return nil, err
		}
		words = append(words, w)
	}
	return words, rows.Err()
}

func (r *pgWordRepository) GetWordByEnglish(english string) (models.Word, error) {
	var w models.Word
	err := r.db.QueryRow(`SELECT id, english, vietnamese, level FROM words WHERE english=$1`, english).Scan(&w.ID, &w.English, &w.Vietnamese, &w.Level)
	return w, err
}

func main() {
	database, err := db.New()
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	repo := &pgWordRepository{db: database}
	svc := service.NewService(repo)
	hdl := handler.NewHandler(svc)

	r := mux.NewRouter()
	hdl.RegisterRoutes(r)

	// simple CORS
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
