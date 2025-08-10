package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"github.com/hungdhv97/english-vocab-trainer/backend/internal/handler"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/service"
)

func main() {
	_ = godotenv.Load()

	viper.SetDefault("PORT", "8180")
	viper.AutomaticEnv()
	port := viper.GetString("PORT")

	logger, _ := zap.NewProduction()
	defer logger.Sync()

	svc := service.NewService()
	hdl := handler.NewHandler(svc)

	r := gin.New()
	r.Use(gin.Recovery())

	r.Use(func(c *gin.Context) {
		start := time.Now()
		c.Next()
		logger.Info("request",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("duration", time.Since(start)))
	})

	r.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			c.Writer.Header().Set("Vary", "Origin")
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	hdl.RegisterRoutes(r)

	logger.Info("Starting server", zap.String("port", port))
	if err := r.Run(":" + port); err != nil {
		logger.Fatal("server failed", zap.Error(err))
	}
}
