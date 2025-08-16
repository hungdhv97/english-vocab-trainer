package middleware

import "github.com/gin-gonic/gin"

// Recovery wraps gin.Recovery for convenience.
func Recovery() gin.HandlerFunc {
	return gin.Recovery()
}
