package config

// Config holds application configuration.
type Config struct {
	HTTP     HTTPConfig     `mapstructure:"http"`
	Postgres PostgresConfig `mapstructure:"postgres"`
	Redis    RedisConfig    `mapstructure:"redis"`
	Cursor   CursorConfig   `mapstructure:"cursor"`
	DeepL    DeepLConfig    `mapstructure:"deepl"`
	Jobs     JobsConfig     `mapstructure:"jobs"`
}

// HTTPConfig holds HTTP server related configuration.
type HTTPConfig struct {
	Addr string `mapstructure:"addr"`
}

// PostgresConfig holds PostgreSQL connection settings.
type PostgresConfig struct {
	Host     string `mapstructure:"host"`
	Port     string `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	Database string `mapstructure:"database"`
}

// RedisConfig holds Redis connection settings.
type RedisConfig struct {
	Addr     string `mapstructure:"addr"`
	Username string `mapstructure:"username"`
	Password string `mapstructure:"password"`
}

// CursorConfig holds JWT cursor settings.
type CursorConfig struct {
	Secret string `mapstructure:"secret"`
}

// DeepLConfig holds DeepL API settings.
type DeepLConfig struct {
	APIKey string `mapstructure:"apikey"`
}

// JobsConfig holds cron job settings.
type JobsConfig struct {
	TranslateMissing TranslateMissingJobConfig `mapstructure:"translate_missing"`
	UniverseIndex    UniverseIndexJobConfig    `mapstructure:"universe_index"`
}

// TranslateMissingJobConfig holds configuration for the translate missing job.
type TranslateMissingJobConfig struct {
	Schedule  string `mapstructure:"schedule"`
	Enabled   bool   `mapstructure:"enabled"`
	BatchSize int    `mapstructure:"batch_size"`
}

// UniverseIndexJobConfig holds configuration for the universe index rebuild job.
type UniverseIndexJobConfig struct {
	Schedule string `mapstructure:"schedule"`
	Enabled  bool   `mapstructure:"enabled"`
}
