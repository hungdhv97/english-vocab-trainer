package middleware

import (
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
)

// Gzip enables gzip compression.
func Gzip() gin.HandlerFunc {
	return gzip.Gzip(gzip.DefaultCompression)
}
