package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"users/internal/repository"
)

type NotificationHandler struct {
	notificationRepo *repository.NotificationRepository
}

func NewNotificationHandler(notificationRepo *repository.NotificationRepository) *NotificationHandler {
	return &NotificationHandler{notificationRepo: notificationRepo}
}

// ==========================================
// 5. GET /api/notifications
// ดึงการแจ้งเตือนทั้งหมด
// ==========================================

func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	// ดึง user_id จาก JWT claims
	userIDRaw, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "UNAUTHORIZED",
				"message": "กรุณาเข้าสู่ระบบ",
			},
		})
		return
	}

	userID, ok := userIDRaw.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "ข้อมูล user ID ไม่ถูกต้อง",
			},
		})
		return
	}

	// รับ query parameters
	limitStr := c.DefaultQuery("limit", "20")
	pageStr := c.DefaultQuery("page", "1")
	unreadOnlyStr := c.DefaultQuery("unreadOnly", "false")
	notifType := c.Query("type") // schedule | progress | achievement | system

	limit, _ := strconv.Atoi(limitStr)
	page, _ := strconv.Atoi(pageStr)
	unreadOnly := unreadOnlyStr == "true"

	// ดึงข้อมูลจาก repository
	response, err := h.notificationRepo.GetNotifications(userID, limit, page, unreadOnly, notifType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "เกิดข้อผิดพลาดในการดึงข้อมูล",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// ==========================================
// PUT /api/notifications/:id/read
// Mark notification as read
// ==========================================

func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	// ดึง notification_id จาก URL params
	notificationIDStr := c.Param("id")
	notificationID, err := strconv.Atoi(notificationIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INVALID_INPUT",
				"message": "รูปแบบ ID ไม่ถูกต้อง",
			},
		})
		return
	}

	// ดึง user_id จาก JWT claims
	userIDRaw, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "UNAUTHORIZED",
				"message": "กรุณาเข้าสู่ระบบ",
			},
		})
		return
	}

	userID, ok := userIDRaw.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "ข้อมูล user ID ไม่ถูกต้อง",
			},
		})
		return
	}

	// Mark as read
	err = h.notificationRepo.MarkAsRead(notificationID, userID)
	if err != nil {
		if err.Error() == "ไม่พบการแจ้งเตือนนี้หรือคุณไม่มีสิทธิ์เข้าถึง" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": err.Error(),
				},
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "เกิดข้อผิดพลาดในการอัพเดตข้อมูล",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "อ่านการแจ้งเตือนแล้ว",
	})
}

// ==========================================
// PUT /api/notifications/read-all
// Mark all notifications as read
// ==========================================

func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	// ดึง user_id จาก JWT claims
	userIDRaw, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "UNAUTHORIZED",
				"message": "กรุณาเข้าสู่ระบบ",
			},
		})
		return
	}

	userID, ok := userIDRaw.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "ข้อมูล user ID ไม่ถูกต้อง",
			},
		})
		return
	}

	// Mark all as read
	markedCount, err := h.notificationRepo.MarkAllAsRead(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "เกิดข้อผิดพลาดในการอัพเดตข้อมูล",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "อ่านการแจ้งเตือนทั้งหมดแล้ว",
		"data": gin.H{
			"markedCount": markedCount,
		},
	})
}
