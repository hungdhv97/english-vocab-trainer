package db

import (
	"context"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/config"
	"github.com/redis/go-redis/v9"
)

// NewRedisClient creates a new Redis client.
func NewRedisClient(cfg *config.Config) (*redis.Client, error) {
	r := cfg.Redis
	client := redis.NewClient(&redis.Options{
		Addr: r.Addr,
		Username: r.Username,
		Password: r.Password,
		DB:   0,
	})
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, err
	}
	return client, nil
}
