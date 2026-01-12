package middleware

import (
	"fitness-training-backend/internal/config"
	"fitness-training-backend/pkg/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	// ContextUserIDKey is the key for user ID in context
	ContextUserIDKey = "userID"
	// ContextUserRoleKey is the key for user role in context
	ContextUserRoleKey = "userRole"
	// ContextUserEmailKey is the key for user email in context
	ContextUserEmailKey = "userEmail"
)

// AuthMiddleware validates JWT token
func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Try to get token from cookie first
		token, err := c.Cookie("auth_token")
		
		// If not in cookie, try Authorization header
		if err != nil || token == "" {
			authHeader := c.GetHeader("Authorization")
			if authHeader == "" {
				utils.Unauthorized(c, "Authorization token required")
				c.Abort()
				return
			}
			
			// Extract token from "Bearer <token>"
			token = utils.ExtractToken(authHeader)
		}
		
		// Validate token
		claims, err := utils.ValidateToken(token, cfg.JWT.Secret)
		if err != nil {
			if err == utils.ErrExpiredToken {
				utils.Unauthorized(c, "Token has expired")
			} else {
				utils.Unauthorized(c, "Invalid token")
			}
			c.Abort()
			return
		}
		
		// Set user info in context
		c.Set(ContextUserIDKey, claims.UserID)
		c.Set(ContextUserRoleKey, claims.Role)
		c.Set(ContextUserEmailKey, claims.Email)
		
		c.Next()
	}
}

// GetUserID retrieves user ID from context
func GetUserID(c *gin.Context) (uint, bool) {
	userID, exists := c.Get(ContextUserIDKey)
	if !exists {
		return 0, false
	}
	return userID.(uint), true
}

// GetUserRole retrieves user role from context
func GetUserRole(c *gin.Context) (string, bool) {
	role, exists := c.Get(ContextUserRoleKey)
	if !exists {
		return "", false
	}
	return role.(string), true
}

// GetUserEmail retrieves user email from context
func GetUserEmail(c *gin.Context) (string, bool) {
	email, exists := c.Get(ContextUserEmailKey)
	if !exists {
		return "", false
	}
	return email.(string), true
}

// OptionalAuth middleware that doesn't require authentication but extracts user if present
func OptionalAuth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Try to get token
		token, err := c.Cookie("auth_token")
		if err != nil || token == "" {
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" {
				token = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}
		
		// If token exists, validate it
		if token != "" {
			claims, err := utils.ValidateToken(token, cfg.JWT.Secret)
			if err == nil {
				c.Set(ContextUserIDKey, claims.UserID)
				c.Set(ContextUserRoleKey, claims.Role)
				c.Set(ContextUserEmailKey, claims.Email)
			}
		}
		
		c.Next()
	}
}
