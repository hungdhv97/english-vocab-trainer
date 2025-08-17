package config

// Config holds application configuration.
type Config struct {
	HTTP     HTTPConfig     `mapstructure:"http"`
	Postgres PostgresConfig `mapstructure:"postgres"`
	Redis    RedisConfig    `mapstructure:"redis"`
	Cursor   CursorConfig   `mapstructure:"cursor"`
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
