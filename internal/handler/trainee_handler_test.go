package handler

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"users/internal/repository"
)

// MockTraineeRepository - Mock สำหรับ TraineeRepository
type MockTraineeRepository struct {
	mock.Mock
}

func (m *MockTraineeRepository) GetUpcomingSchedules(clientID int, days int) (*repository.UpcomingResponse, error) {
	args := m.Called(clientID, days)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.UpcomingResponse), args.Error(1)
}

func (m *MockTraineeRepository) GetScheduleByID(scheduleID, clientID int) (*repository.ScheduleDetail, error) {
	args := m.Called(scheduleID, clientID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.ScheduleDetail), args.Error(1)
}

func (m *MockTraineeRepository) GetCurrentProgram(clientID int) (*repository.CurrentProgram, error) {
	args := m.Called(clientID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.CurrentProgram), args.Error(1)
}

func (m *MockTraineeRepository) GetTraineeStats(clientID int) (*repository.TraineeStats, error) {
	args := m.Called(clientID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.TraineeStats), args.Error(1)
}

func setupTraineeTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return gin.New()
}

// ==========================================
// GetUpcomingSchedules Tests
// ==========================================

func TestGetUpcomingSchedules_Success(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	// Mock data
	expectedResponse := &repository.UpcomingResponse{
		UpcomingSessions: []repository.UpcomingSession{
			{
				ID:       1,
				Date:     "2026-01-10",
				Time:     "14:00",
				Duration: 60,
				Title:    "Strength Training",
				Status:   "confirmed",
			},
		},
		Calendar: []repository.CalendarDay{
			{
				Date:         "2026-01-10",
				DayName:      "วันศุกร์",
				IsToday:      true,
				HasSession:   true,
				SessionCount: 1,
			},
		},
	}

	mockRepo.On("GetUpcomingSchedules", 1, 7).Return(expectedResponse, nil)

	// Setup route with mock auth
	router.GET("/schedules/upcoming", func(c *gin.Context) {
		c.Set("clientID", 1)
		c.Next()
	}, handler.GetUpcomingSchedules)

	// Make request
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/schedules/upcoming", nil)
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"success":true`)
	assert.Contains(t, w.Body.String(), "Strength Training")
	mockRepo.AssertExpectations(t)
}

func TestGetUpcomingSchedules_WithCustomDays(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	expectedResponse := &repository.UpcomingResponse{
		UpcomingSessions: []repository.UpcomingSession{},
		Calendar:         []repository.CalendarDay{},
	}

	// Expect 14 days
	mockRepo.On("GetUpcomingSchedules", 1, 14).Return(expectedResponse, nil)

	router.GET("/schedules/upcoming", func(c *gin.Context) {
		c.Set("clientID", 1)
		c.Next()
	}, handler.GetUpcomingSchedules)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/schedules/upcoming?days=14", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockRepo.AssertExpectations(t)
}

func TestGetUpcomingSchedules_Unauthorized(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	// No clientID set in context
	router.GET("/schedules/upcoming", handler.GetUpcomingSchedules)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/schedules/upcoming", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "UNAUTHORIZED")
}

func TestGetUpcomingSchedules_InternalError(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	mockRepo.On("GetUpcomingSchedules", 1, 7).Return(nil, errors.New("database error"))

	router.GET("/schedules/upcoming", func(c *gin.Context) {
		c.Set("clientID", 1)
		c.Next()
	}, handler.GetUpcomingSchedules)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/schedules/upcoming", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	mockRepo.AssertExpectations(t)
}

// ==========================================
// GetScheduleByID Tests
// ==========================================

func TestGetScheduleByID_Success(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	expectedSchedule := &repository.ScheduleDetail{
		ID:          1,
		Date:        "2026-01-10",
		Time:        "14:00",
		Duration:    60,
		Title:       "Strength Training",
		Description: "เน้นกล้ามเนื้อส่วนบน",
		Status:      "confirmed",
	}

	mockRepo.On("GetScheduleByID", 1, 1).Return(expectedSchedule, nil)

	router.GET("/schedules/:id", func(c *gin.Context) {
		c.Set("clientID", 1)
		c.Next()
	}, handler.GetScheduleByID)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/schedules/1", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "Strength Training")
	mockRepo.AssertExpectations(t)
}

func TestGetScheduleByID_NotFound(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	mockRepo.On("GetScheduleByID", 999, 1).Return(nil, errors.New("ไม่พบนัดหมายนี้"))

	router.GET("/schedules/:id", func(c *gin.Context) {
		c.Set("clientID", 1)
		c.Next()
	}, handler.GetScheduleByID)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/schedules/999", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	assert.Contains(t, w.Body.String(), "NOT_FOUND")
	mockRepo.AssertExpectations(t)
}

func TestGetScheduleByID_InvalidID(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	router.GET("/schedules/:id", func(c *gin.Context) {
		c.Set("clientID", 1)
		c.Next()
	}, handler.GetScheduleByID)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/schedules/invalid", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "INVALID_INPUT")
}

// ==========================================
// GetCurrentProgram Tests
// ==========================================

func TestGetCurrentProgram_Success(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	expectedProgram := &repository.CurrentProgram{
		ID:                 1,
		Name:               "Full Body Strength",
		Description:        "โปรแกรมเน้นเพิ่มความแข็งแรง",
		Duration:           "12 สัปดาห์",
		CurrentWeek:        4,
		TotalWeeks:         12,
		ProgressPercentage: 33.3,
		Status:             "active",
	}

	mockRepo.On("GetCurrentProgram", 1).Return(expectedProgram, nil)

	router.GET("/programs/current", func(c *gin.Context) {
		c.Set("clientID", 1)
		c.Next()
	}, handler.GetCurrentProgram)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/programs/current", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "Full Body Strength")
	mockRepo.AssertExpectations(t)
}

func TestGetCurrentProgram_NotFound(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	mockRepo.On("GetCurrentProgram", 1).Return(nil, errors.New("ไม่พบโปรแกรมปัจจุบัน"))

	router.GET("/programs/current", func(c *gin.Context) {
		c.Set("clientID", 1)
		c.Next()
	}, handler.GetCurrentProgram)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/programs/current", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	assert.Contains(t, w.Body.String(), "ยังไม่มีโปรแกรมการฝึกที่กำลังดำเนินการ")
	mockRepo.AssertExpectations(t)
}

func TestGetCurrentProgram_Unauthorized(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	router.GET("/programs/current", handler.GetCurrentProgram)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/programs/current", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// ==========================================
// GetTraineeStats Tests
// ==========================================

func TestGetTraineeStats_Success(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	expectedStats := &repository.TraineeStats{
		TotalSessions:          124,
		CompletedSessions:      98,
		UpcomingSessions:       6,
		CancelledSessions:      20,
		CurrentStreak:          5,
		LongestStreak:          21,
		TotalWorkoutHours:      147.5,
		AverageSessionsPerWeek: 3.2,
	}

	mockRepo.On("GetTraineeStats", 1).Return(expectedStats, nil)

	router.GET("/stats", func(c *gin.Context) {
		c.Set("clientID", 1)
		c.Next()
	}, handler.GetTraineeStats)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/stats", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"totalSessions":124`)
	assert.Contains(t, w.Body.String(), `"currentStreak":5`)
	mockRepo.AssertExpectations(t)
}

func TestGetTraineeStats_Unauthorized(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	router.GET("/stats", handler.GetTraineeStats)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/stats", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestGetTraineeStats_InternalError(t *testing.T) {
	mockRepo := new(MockTraineeRepository)
	handler := NewTraineeHandler(mockRepo)
	router := setupTraineeTestRouter()

	mockRepo.On("GetTraineeStats", 1).Return(nil, errors.New("database error"))

	router.GET("/stats", func(c *gin.Context) {
		c.Set("clientID", 1)
		c.Next()
	}, handler.GetTraineeStats)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/stats", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	mockRepo.AssertExpectations(t)
}
