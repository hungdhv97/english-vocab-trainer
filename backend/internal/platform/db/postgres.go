package db

import (
	"context"
	"fmt"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPostgresPool creates a new PostgreSQL connection pool.
func NewPostgresPool(cfg *config.Config) (*pgxpool.Pool, error) {
	pg := cfg.Postgres
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", pg.User, pg.Password, pg.Host, pg.Port, pg.Database)
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(context.Background()); err != nil {
		return nil, err
	}
	return pool, nil
}
