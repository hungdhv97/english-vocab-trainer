package db

import (
	"database/sql"
	"os"

	_ "github.com/lib/pq"
)

// New opens a PostgreSQL connection using the DATABASE_URL environment variable.
func New() (*sql.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://user:password@localhost:5433/vocab?sslmode=disable"
	}
	return sql.Open("postgres", dsn)
}
