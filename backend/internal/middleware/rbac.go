package middleware

import (
	"fitness-training-backend/pkg/utils"

	"github.com/gin-gonic/gin"
)

// RoleMiddleware checks if user has required role
func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := GetUserRole(c)
		if !exists {
			utils.Unauthorized(c, "User role not found")
			c.Abort()
			return
		}
		
		// Check if user role is in allowed roles
		hasRole := false
		for _, role := range allowedRoles {
			if userRole == role {
				hasRole = true
				break
			}
		}
		
		if !hasRole {
			utils.Forbidden(c, "You don't have permission to access this resource")
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// TraineeOnly middleware allows only trainees (and trainers for testing)
func TraineeOnly() gin.HandlerFunc {
	return RoleMiddleware("trainee", "trainer")
}

// TrainerOnly middleware allows only trainers
func TrainerOnly() gin.HandlerFunc {
	return RoleMiddleware("trainer")
}

// AdminOnly middleware allows only admins
func AdminOnly() gin.HandlerFunc {
	return RoleMiddleware("admin")
}
