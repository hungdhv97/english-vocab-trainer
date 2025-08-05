package main

import (
	"log"
	"net/http"

	"github.com/gemini-demo-apps/vocab-app/internal/handler"
	"github.com/gemini-demo-apps/vocab-app/internal/service"
	"github.com/gorilla/mux"
)

func main() {
	svc := service.NewService()
	hdl := handler.NewHandler(svc)
	r := mux.NewRouter()
	hdl.RegisterRoutes(r)

	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	log.Println("Starting server on :8090")
	if err := http.ListenAndServe(":8090", r); err != nil {
		log.Fatal(err)
	}
}
