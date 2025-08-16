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
	v.SetDefault("http.addr", ":8180")
	v.SetDefault("postgres.host", "postgres")
	v.SetDefault("postgres.port", "5432")
	v.SetDefault("postgres.user", "user")
	v.SetDefault("postgres.password", "password")
	v.SetDefault("postgres.database", "vocab")
	v.SetDefault("redis.addr", "redis:6379")
	v.SetDefault("redis.username", "")
	v.SetDefault("redis.password", "")

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
