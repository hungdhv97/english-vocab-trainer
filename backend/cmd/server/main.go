package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	api := r.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/words", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Welcome to the words endpoint!")
	}).Methods("GET")

	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}
