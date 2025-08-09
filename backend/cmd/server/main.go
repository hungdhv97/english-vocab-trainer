package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/handler"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/service"
)

func main() {
	svc := service.NewService()
	hdl := handler.NewHandler(svc)
	r := mux.NewRouter()
	hdl.RegisterRoutes(r)

	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin != "" {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			} else {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	log.Println("Starting server on :8180")
	if err := http.ListenAndServe(":8180", r); err != nil {
		log.Fatal(err)
	}
}
