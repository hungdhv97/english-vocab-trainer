package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://user:password@localhost:5433/vocab?sslmode=disable"
	}
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer db.Close()

	data, err := os.ReadFile("cmd/server/dictionary.json")
	if err != nil {
		log.Fatalf("read dictionary: %v", err)
	}
	var words []struct {
		En string `json:"en"`
		Vi string `json:"vi"`
	}
	if err := json.Unmarshal(data, &words); err != nil {
		log.Fatalf("unmarshal: %v", err)
	}
	for _, w := range words {
		if _, err := db.Exec(`INSERT INTO words (english, vietnamese, level) VALUES ($1,$2,1) ON CONFLICT (english) DO NOTHING`, w.En, w.Vi); err != nil {
			log.Fatalf("insert: %v", err)
		}
	}
	log.Printf("Inserted %d words", len(words))
}
