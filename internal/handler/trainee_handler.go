package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"users/internal/repository"
)

type TraineeHandler struct {
	traineeRepo *repository.TraineeRepository
}

func NewTraineeHandler(traineeRepo *repository.TraineeRepository) *TraineeHandler {
	return &TraineeHandler{traineeRepo: traineeRepo}
}

// ==========================================
// 1. GET /api/schedules/upcoming
// ดึงนัดหมาย 7 วันข้างหน้า
// ==========================================

func (h *TraineeHandler) GetUpcomingSchedules(c *gin.Context) {
	// ดึง client_id จาก JWT claims (หรือจาก query params)
	clientIDRaw, exists := c.Get("clientID")
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

	clientID, ok := clientIDRaw.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "ข้อมูล client ID ไม่ถูกต้อง",
			},
		})
		return
	}

	// รับ query parameter: days (จำนวนวันข้างหน้า - default 7)
	daysStr := c.DefaultQuery("days", "7")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		days = 7
	}

	// ดึงข้อมูลจาก repository
	response, err := h.traineeRepo.GetUpcomingSchedules(clientID, days)
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
// 2. GET /api/schedules/:id
// ดึงรายละเอียดนัดหมายทีละรายการ
// ==========================================

func (h *TraineeHandler) GetScheduleByID(c *gin.Context) {
	// ดึง schedule_id จาก URL params
	scheduleIDStr := c.Param("id")
	scheduleID, err := strconv.Atoi(scheduleIDStr)
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

	// ดึง client_id จาก JWT claims
	clientIDRaw, exists := c.Get("clientID")
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

	clientID, ok := clientIDRaw.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "ข้อมูล client ID ไม่ถูกต้อง",
			},
		})
		return
	}

	// ดึงข้อมูลจาก repository
	schedule, err := h.traineeRepo.GetScheduleByID(scheduleID, clientID)
	if err != nil {
		if err.Error() == "ไม่พบนัดหมายนี้" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "ไม่พบนัดหมายนี้",
				},
			})
			return
		}

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
		"data":    schedule,
	})
}

// ==========================================
// 3. GET /api/programs/current
// ดึงโปรแกรมปัจจุบันของ Trainee
// ==========================================

func (h *TraineeHandler) GetCurrentProgram(c *gin.Context) {
	// ดึง client_id จาก JWT claims
	clientIDRaw, exists := c.Get("clientID")
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

	clientID, ok := clientIDRaw.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "ข้อมูล client ID ไม่ถูกต้อง",
			},
		})
		return
	}

	// ดึงข้อมูลจาก repository
	program, err := h.traineeRepo.GetCurrentProgram(clientID)
	if err != nil {
		if err.Error() == "ไม่พบโปรแกรมปัจจุบัน" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "คุณยังไม่มีโปรแกรมการฝึกที่กำลังดำเนินการ",
				},
			})
			return
		}

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
		"data":    program,
	})
}

// ==========================================
// 4. GET /api/trainee/stats
// ดึงสถิติสรุปของ Trainee
// ==========================================

func (h *TraineeHandler) GetTraineeStats(c *gin.Context) {
	// ดึง client_id จาก JWT claims
	clientIDRaw, exists := c.Get("clientID")
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

	clientID, ok := clientIDRaw.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": gin.H{
				"code":    "INTERNAL_ERROR",
				"message": "ข้อมูล client ID ไม่ถูกต้อง",
			},
		})
		return
	}

	// ดึงข้อมูลจาก repository
	stats, err := h.traineeRepo.GetTraineeStats(clientID)
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
		"data":    stats,
	})
}
