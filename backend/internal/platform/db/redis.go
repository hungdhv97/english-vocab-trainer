package db

import (
	"context"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/config"
	"github.com/redis/go-redis/v9"
)

// NewRedisClient creates a new Redis client.
func NewRedisClient(cfg *config.Config) (*redis.Client, error) {
	r := cfg.Redis
	opts := &redis.Options{
		Addr: r.Addr,
		DB:   0,
	}
	if r.Username != "" {
		opts.Username = r.Username
	}
	if r.Password != "" {
		opts.Password = r.Password
	}
	client := redis.NewClient(opts)
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, err
	}
	return client, nil
}
