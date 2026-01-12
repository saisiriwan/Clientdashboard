package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Cookie   CookieConfig
	Google   GoogleOAuthConfig
	CORS     CORSConfig
	Logging  LoggingConfig
	RateLimit RateLimitConfig
	Frontend FrontendConfig
}

type ServerConfig struct {
	Host string
	Port string
	Env  string // development, staging, production
}

type DatabaseConfig struct {
	Host            string
	Port            string
	User            string
	Password        string
	DBName          string
	SSLMode         string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

type JWTConfig struct {
	Secret              string
	AccessTokenExpiry   time.Duration
	RefreshTokenExpiry  time.Duration
}

type CookieConfig struct {
	Domain   string
	Secure   bool
	HTTPOnly bool
	SameSite string // Lax, Strict, None
}

type GoogleOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type CORSConfig struct {
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

type LoggingConfig struct {
	Level  string // debug, info, warn, error
	Format string // json, text
}

type RateLimitConfig struct {
	Enabled  bool
	Requests int
	Duration time.Duration
}

type FrontendConfig struct {
	URL string
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if exists (ignored in production)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cfg := &Config{
		Server: ServerConfig{
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
			Port: getEnv("SERVER_PORT", "8080"),
			Env:  getEnv("SERVER_ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:            getEnv("DB_HOST", "localhost"),
			Port:            getEnv("DB_PORT", "5432"),
			User:            getEnv("DB_USER", "postgres"),
			Password:        getEnv("DB_PASSWORD", "postgres"),
			DBName:          getEnv("DB_NAME", "fitness_training"),
			SSLMode:         getEnv("DB_SSLMODE", "disable"),
			MaxOpenConns:    getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:    getEnvAsInt("DB_MAX_IDLE_CONNS", 5),
			ConnMaxLifetime: getEnvAsDuration("DB_CONN_MAX_LIFETIME", "5m"),
		},
		JWT: JWTConfig{
			Secret:             getEnv("JWT_SECRET", "your-super-secret-jwt-key"),
			AccessTokenExpiry:  getEnvAsDuration("JWT_ACCESS_TOKEN_EXPIRY", "15m"),
			RefreshTokenExpiry: getEnvAsDuration("JWT_REFRESH_TOKEN_EXPIRY", "168h"), // 7 days
		},
		Cookie: CookieConfig{
			Domain:   getEnv("COOKIE_DOMAIN", "localhost"),
			Secure:   getEnvAsBool("COOKIE_SECURE", false),
			HTTPOnly: getEnvAsBool("COOKIE_HTTP_ONLY", true),
			SameSite: getEnv("COOKIE_SAME_SITE", "Lax"),
		},
		Google: GoogleOAuthConfig{
			ClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
			ClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
			RedirectURL:  getEnv("GOOGLE_REDIRECT_URL", ""),
		},
		CORS: CORSConfig{
			AllowedOrigins: getEnvAsSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:5173"}),
			AllowedMethods: getEnvAsSlice("CORS_ALLOWED_METHODS", []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}),
			AllowedHeaders: getEnvAsSlice("CORS_ALLOWED_HEADERS", []string{"Origin", "Content-Type", "Accept", "Authorization"}),
		},
		Logging: LoggingConfig{
			Level:  getEnv("LOG_LEVEL", "debug"),
			Format: getEnv("LOG_FORMAT", "text"),
		},
		RateLimit: RateLimitConfig{
			Enabled:  getEnvAsBool("RATE_LIMIT_ENABLED", true),
			Requests: getEnvAsInt("RATE_LIMIT_REQUESTS", 100),
			Duration: getEnvAsDuration("RATE_LIMIT_DURATION", "1m"),
		},
		Frontend: FrontendConfig{
			URL: getEnv("FRONTEND_URL", "http://localhost:5173"),
		},
	}

	// Validate required fields
	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// Validate validates required configuration
func (c *Config) Validate() error {
	if c.JWT.Secret == "" || c.JWT.Secret == "your-super-secret-jwt-key" {
		return fmt.Errorf("JWT_SECRET must be set and changed from default")
	}

	if c.Server.Env == "production" {
		if !c.Cookie.Secure {
			log.Println("Warning: COOKIE_SECURE should be true in production")
		}
		if c.Database.SSLMode == "disable" {
			log.Println("Warning: DB_SSLMODE should not be disabled in production")
		}
	}

	return nil
}

// IsProd returns true if running in production
func (c *Config) IsProd() bool {
	return c.Server.Env == "production"
}

// IsDev returns true if running in development
func (c *Config) IsDev() bool {
	return c.Server.Env == "development"
}

// GetAddress returns server address (host:port)
func (c *Config) GetAddress() string {
	return fmt.Sprintf("%s:%s", c.Server.Host, c.Server.Port)
}

// GetDSN returns database connection string
func (c *Config) GetDSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.DBName,
		c.Database.SSLMode,
	)
}

// Helper functions
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	valueStr := getEnv(key, "")
	if value, err := strconv.ParseBool(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsDuration(key, defaultValue string) time.Duration {
	valueStr := getEnv(key, defaultValue)
	if duration, err := time.ParseDuration(valueStr); err == nil {
		return duration
	}
	return 0
}

func getEnvAsSlice(key string, defaultValue []string) []string {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return defaultValue
	}
	return strings.Split(valueStr, ",")
}
