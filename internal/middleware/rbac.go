package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireRole - Middleware ตรวจสอบว่า User มี Role ที่ได้รับอนุญาตหรือไม่
// ใช้สำหรับควบคุมการเข้าถึง API ตาม Role (trainer, trainee)
//
// ตัวอย่างการใช้งาน:
//   protected.Use(middleware.RequireRole("trainer"))
//   protected.Use(middleware.RequireRole("trainer", "trainee"))
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// ดึง role จาก JWT Claims (set ไว้ใน JWTCookieAuth middleware)
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "กรุณาเข้าสู่ระบบ",
				},
			})
			c.Abort()
			return
		}

		role, ok := userRole.(string)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INTERNAL_ERROR",
					"message": "ข้อมูล role ไม่ถูกต้อง",
				},
			})
			c.Abort()
			return
		}

		// ตรวจสอบว่า role ของ user อยู่ใน allowedRoles หรือไม่
		for _, allowedRole := range allowedRoles {
			if role == allowedRole {
				c.Next()
				return
			}
		}

		// ถ้าไม่มีสิทธิ์ - ส่ง 403 Forbidden
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "FORBIDDEN",
				"message": "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
			},
		})
		c.Abort()
	}
}

// RequireTrainer - Middleware สำหรับ Trainer เท่านั้น
func RequireTrainer() gin.HandlerFunc {
	return RequireRole("trainer")
}

// RequireTrainee - Middleware สำหรับ Trainee เท่านั้น
func RequireTrainee() gin.HandlerFunc {
	return RequireRole("trainee")
}

// AllowAll - Middleware สำหรับทั้ง Trainer และ Trainee
func AllowAll() gin.HandlerFunc {
	return RequireRole("trainer", "trainee")
}

// CheckResourceOwnership - Middleware ตรวจสอบว่า User เข้าถึงข้อมูลของตัวเองเท่านั้น
// ใช้สำหรับ Trainee ที่ต้องการดูข้อมูลของตัวเองเท่านั้น
//
// ตัวอย่างการใช้งาน:
//   protected.GET("/clients/:id/sessions", middleware.CheckResourceOwnership("id"), handler.GetSessions)
func CheckResourceOwnership(paramKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, _ := c.Get("role")
		userID, _ := c.Get("userID")

		// ถ้าเป็น Trainer - อนุญาตเข้าถึงข้อมูลทุกคน
		if userRole == "trainer" {
			c.Next()
			return
		}

		// ถ้าเป็น Trainee - ตรวจสอบว่าเข้าถึงข้อมูลของตัวเองเท่านั้น
		if userRole == "trainee" {
			resourceID := c.Param(paramKey)
			userIDStr := ""

			// แปลง userID เป็น string
			switch v := userID.(type) {
			case int:
				userIDStr = string(rune(v + '0'))
			case int64:
				userIDStr = string(rune(v + '0'))
			case string:
				userIDStr = v
			}

			// ถ้า resourceID ไม่ตรงกับ userID - ห้ามเข้าถึง
			if resourceID != userIDStr {
				c.JSON(http.StatusForbidden, gin.H{
					"success": false,
					"error": gin.H{
						"code":    "FORBIDDEN",
						"message": "คุณไม่สามารถเข้าถึงข้อมูลของผู้อื่นได้",
					},
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}
