package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/spf13/viper"
)

// Load reads configuration from files and environment variables.
// Precedence: defaults < config file < env variables.
func Load() (*Config, error) {
	v := viper.New()

	// defaults
	v.SetDefault("env", "development")
	v.SetDefault("http.addr", ":8180")
	v.SetDefault("postgres.host", "postgres")
	v.SetDefault("postgres.port", "5432")
	v.SetDefault("postgres.user", "user")
	v.SetDefault("postgres.password", "password")
	v.SetDefault("postgres.database", "vocab")
	v.SetDefault("redis.addr", "redis:6379")
	v.SetDefault("redis.username", "default")
	v.SetDefault("redis.password", "password")
	v.SetDefault("redis.pool_size", 10)
	v.SetDefault("redis.min_idle_conns", 5)
	v.SetDefault("cursor.secret", "changeme")
	v.SetDefault("deepl.apikey", "")

	// JWT defaults
	v.SetDefault("jwt.secret", "changeme-jwt-secret")

	// CORS defaults
	v.SetDefault("cors.allowed_origins", []string{"http://localhost:3000", "http://localhost:5173"})

	// Rate limiting defaults
	v.SetDefault("rate_limit.requests_per_minute", 60)

	// Security defaults
	v.SetDefault("security.bcrypt_cost", 10)
	v.SetDefault("security.session_timeout", "24h")
	v.SetDefault("security.cookie_secure", false)
	v.SetDefault("security.cookie_http_only", true)
	v.SetDefault("security.cookie_same_site", "lax")

	// Database performance defaults
	v.SetDefault("database.max_open_conns", 25)
	v.SetDefault("database.max_idle_conns", 25)
	v.SetDefault("database.conn_max_lifetime", "300s")

	// Monitoring defaults
	v.SetDefault("monitoring.enable_metrics", false)
	v.SetDefault("monitoring.metrics_port", 9100)

	// Health check defaults
	v.SetDefault("health.timeout", "30s")
	v.SetDefault("health.interval", "1m")

	// Logging defaults
	v.SetDefault("log.level", "info")

	// jobs defaults
	v.SetDefault("jobs.translate_missing.enabled", true)
	v.SetDefault("jobs.translate_missing.schedule", "0 * * * *") // Every hour
	v.SetDefault("jobs.translate_missing.batch_size", 100)

	// config file
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath("configs")
	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("read config: %w", err)
		}
	}

	// override with env-specific file
	env := os.Getenv("APP_ENV")
	if env != "" {
		envFile := filepath.Join("configs", fmt.Sprintf("config.%s.yaml", env))
		v.SetConfigFile(envFile)
		if err := v.MergeInConfig(); err != nil {
			return nil, fmt.Errorf("merge env config: %w", err)
		}
	}

	// environment variables
	v.SetEnvPrefix("APP")
	v.AutomaticEnv()
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("unmarshal config: %w", err)
	}
	return &cfg, nil
}
