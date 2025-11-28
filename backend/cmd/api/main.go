package main

import (
	"log"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/config"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/db"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/server"
	"go.uber.org/zap"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	logger, _ := zap.NewProduction()
	defer logger.Sync()

	pg, err := db.NewPostgresPool(cfg)
	if err != nil {
		logger.Fatal("postgres", zap.Error(err))
	}
	defer pg.Close()

	rdb, err := db.NewRedisClient(cfg)
	if err != nil {
		logger.Fatal("redis", zap.Error(err))
	}
	defer rdb.Close()

	d := &deps.Deps{Cfg: cfg, Log: logger, PG: pg, RDB: rdb}
	r := server.NewRouter(d)

	logger.Info("Starting server", zap.String("addr", cfg.HTTP.Addr))
	if err := r.Run(cfg.HTTP.Addr); err != nil {
		logger.Fatal("server failed", zap.Error(err))
	}
}
