package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// LoggerMiddleware logs HTTP requests
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		
		// Process request
		c.Next()
		
		// Calculate latency
		latency := time.Since(start)
		
		// Get status code
		statusCode := c.Writer.Status()
		
		// Get client IP
		clientIP := c.ClientIP()
		
		// Get method
		method := c.Request.Method
		
		// Log format
		log.Printf("[GIN] %v | %3d | %13v | %15s | %-7s %s%s",
			start.Format("2006/01/02 - 15:04:05"),
			statusCode,
			latency,
			clientIP,
			method,
			path,
			func() string {
				if query != "" {
					return "?" + query
				}
				return ""
			}(),
		)
	}
}
