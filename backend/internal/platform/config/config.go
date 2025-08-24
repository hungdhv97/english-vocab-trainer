package config

// Config holds application configuration.
type Config struct {
	Env        string         `mapstructure:"env"`
	HTTP       HTTPConfig     `mapstructure:"http"`
	Postgres   PostgresConfig `mapstructure:"postgres"`
	Redis      RedisConfig    `mapstructure:"redis"`
	Cursor     CursorConfig   `mapstructure:"cursor"`
	DeepL      DeepLConfig    `mapstructure:"deepl"`
	Jobs       JobsConfig     `mapstructure:"jobs"`
	JWT        JWTConfig      `mapstructure:"jwt"`
	CORS       CORSConfig     `mapstructure:"cors"`
	RateLimit  RateLimitConfig `mapstructure:"rate_limit"`
	Security   SecurityConfig `mapstructure:"security"`
	Database   DatabaseConfig `mapstructure:"database"`
	Monitoring MonitoringConfig `mapstructure:"monitoring"`
	Health     HealthConfig   `mapstructure:"health"`
	Log        LogConfig      `mapstructure:"log"`
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
	Addr         string `mapstructure:"addr"`
	Username     string `mapstructure:"username"`
	Password     string `mapstructure:"password"`
	PoolSize     int    `mapstructure:"pool_size"`
	MinIdleConns int    `mapstructure:"min_idle_conns"`
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

// JWTConfig holds JWT authentication settings.
type JWTConfig struct {
	Secret string `mapstructure:"secret"`
}

// CORSConfig holds CORS settings.
type CORSConfig struct {
	AllowedOrigins []string `mapstructure:"allowed_origins"`
}

// RateLimitConfig holds rate limiting settings.
type RateLimitConfig struct {
	RequestsPerMinute int `mapstructure:"requests_per_minute"`
}

// SecurityConfig holds security settings.
type SecurityConfig struct {
	BcryptCost     int    `mapstructure:"bcrypt_cost"`
	SessionTimeout string `mapstructure:"session_timeout"`
	CookieSecure   bool   `mapstructure:"cookie_secure"`
	CookieHTTPOnly bool   `mapstructure:"cookie_http_only"`
	CookieSameSite string `mapstructure:"cookie_same_site"`
}

// DatabaseConfig holds database performance settings.
type DatabaseConfig struct {
	MaxOpenConns    int    `mapstructure:"max_open_conns"`
	MaxIdleConns    int    `mapstructure:"max_idle_conns"`
	ConnMaxLifetime string `mapstructure:"conn_max_lifetime"`
}

// MonitoringConfig holds monitoring and metrics settings.
type MonitoringConfig struct {
	EnableMetrics bool `mapstructure:"enable_metrics"`
	MetricsPort   int  `mapstructure:"metrics_port"`
}

// HealthConfig holds health check settings.
type HealthConfig struct {
	Timeout  string `mapstructure:"timeout"`
	Interval string `mapstructure:"interval"`
}

// LogConfig holds logging configuration.
type LogConfig struct {
	Level string `mapstructure:"level"`
}
