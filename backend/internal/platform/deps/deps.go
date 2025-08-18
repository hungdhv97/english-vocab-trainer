package deps

import (
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/config"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/translator"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// Deps holds shared dependencies for handlers and services.
type Deps struct {
	Cfg        *config.Config
	Log        *zap.Logger
	PG         *pgxpool.Pool
	RDB        *redis.Client
	Translator *translator.DeepLTranslator
}
