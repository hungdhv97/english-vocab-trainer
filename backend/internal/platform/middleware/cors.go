package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORS adds production-secure CORS headers with configurable allowed origins.
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		// Get allowed origins from environment variable
		allowedOrigins := getAllowedOrigins()

		// Check if the origin is in the allowed list
		if origin != "" && isOriginAllowed(origin, allowedOrigins) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		} else if isDevelopmentMode() && origin != "" {
			// In development mode, be more permissive but still validate
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		} else if isDevelopmentMode() {
			// Fallback for development without origin header
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		} else {
			// In production, reject requests from non-allowed origins
			c.Writer.Header().Set("Access-Control-Allow-Origin", "null")
		}

		// Set other CORS headers
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "Content-Length, Content-Range, X-Content-Range")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours

		// Handle preflight requests
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// getAllowedOrigins returns the list of allowed origins from environment variable
func getAllowedOrigins() []string {
	originsEnv := os.Getenv("APP_CORS_ALLOWED_ORIGINS")
	if originsEnv == "" {
		// Default allowed origins for production
		return []string{
			"https://your-domain.com",
			"https://www.your-domain.com",
		}
	}

	origins := strings.Split(originsEnv, ",")
	var cleanOrigins []string
	for _, origin := range origins {
		cleanOrigin := strings.TrimSpace(origin)
		if cleanOrigin != "" {
			cleanOrigins = append(cleanOrigins, cleanOrigin)
		}
	}

	return cleanOrigins
}

// isOriginAllowed checks if the given origin is in the allowed list
func isOriginAllowed(origin string, allowedOrigins []string) bool {
	for _, allowed := range allowedOrigins {
		if origin == allowed {
			return true
		}

		// Support wildcard subdomains (e.g., *.example.com)
		if strings.HasPrefix(allowed, "*.") {
			domain := strings.TrimPrefix(allowed, "*.")
			if strings.HasSuffix(origin, "."+domain) {
				return true
			}
		}
	}
	return false
}

// isDevelopmentMode checks if the application is running in development mode
func isDevelopmentMode() bool {
	env := os.Getenv("APP_ENV")
	return env == "development" || env == "dev" || env == ""
}
