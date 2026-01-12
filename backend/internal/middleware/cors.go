package middleware

import (
	"fitness-training-backend/internal/config"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORSMiddleware configures CORS
func CORSMiddleware(cfg *config.Config) gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins:     cfg.CORS.AllowedOrigins,
		AllowMethods:     cfg.CORS.AllowedHeaders,
		AllowHeaders:     cfg.CORS.AllowedHeaders,
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			// In development, allow all origins
			if cfg.IsDev() {
				return true
			}
			// In production, check against allowed origins
			for _, allowed := range cfg.CORS.AllowedOrigins {
				if origin == allowed {
					return true
				}
			}
			return false
		},
		MaxAge: 12 * time.Hour,
	})
}
