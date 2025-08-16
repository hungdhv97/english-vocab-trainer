package middleware

import "github.com/gin-gonic/gin"

// JWT is a placeholder for JWT authentication middleware.
func JWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
	}
}
