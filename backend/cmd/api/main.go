package main

import (
	"log"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/config"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/db"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/jobs"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/server"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/translator"
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

	// Validate DeepL API key
	if cfg.DeepL.APIKey == "" {
		logger.Fatal("DeepL API key is required",
			zap.String("hint", "Please set the APP_DEEPL_API_KEY environment variable"))
	}

	// Initialize DeepL translator
	deepLTranslator, err := translator.NewDeepLTranslator(cfg.DeepL.APIKey)
	if err != nil {
		logger.Fatal("deepl translator", zap.Error(err))
	}

	d := &deps.Deps{Cfg: cfg, Log: logger, PG: pg, RDB: rdb, Translator: deepLTranslator}
	jobs.Start(d)
	r := server.NewRouter(d)

	logger.Info("Starting server", zap.String("addr", cfg.HTTP.Addr))
	if err := r.Run(cfg.HTTP.Addr); err != nil {
		logger.Fatal("server failed", zap.Error(err))
	}
}
