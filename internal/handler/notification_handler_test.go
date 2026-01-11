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

// MockNotificationRepository - Mock สำหรับ NotificationRepository
type MockNotificationRepository struct {
	mock.Mock
}

func (m *MockNotificationRepository) GetNotifications(userID, limit, page int, unreadOnly bool, notifType string) (*repository.NotificationsResponse, error) {
	args := m.Called(userID, limit, page, unreadOnly, notifType)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*repository.NotificationsResponse), args.Error(1)
}

func (m *MockNotificationRepository) MarkAsRead(notificationID, userID int) error {
	args := m.Called(notificationID, userID)
	return args.Error(0)
}

func (m *MockNotificationRepository) MarkAllAsRead(userID int) (int, error) {
	args := m.Called(userID)
	return args.Int(0), args.Error(1)
}

func (m *MockNotificationRepository) GetUnreadCount(userID int) (int, error) {
	args := m.Called(userID)
	return args.Int(0), args.Error(1)
}

func (m *MockNotificationRepository) CreateNotification(input repository.CreateNotificationInput) error {
	args := m.Called(input)
	return args.Error(0)
}

func setupNotificationTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return gin.New()
}

// TestGetNotifications_Success
func TestGetNotifications_Success(t *testing.T) {
	mockRepo := new(MockNotificationRepository)
	handler := NewNotificationHandler(mockRepo)
	router := setupNotificationTestRouter()

	// Mock data
	expectedResponse := &repository.NotificationsResponse{
		Notifications: []repository.Notification{
			{
				ID:       1,
				Type:     "schedule",
				Title:    "Test Notification",
				Message:  "Test Message",
				Priority: "high",
				IsRead:   false,
			},
		},
		Pagination: repository.Pagination{
			CurrentPage:  1,
			TotalPages:   1,
			TotalItems:   1,
			ItemsPerPage: 20,
		},
		UnreadCount: 5,
	}

	mockRepo.On("GetNotifications", 1, 20, 1, false, "").Return(expectedResponse, nil)

	// Setup route with mock auth
	router.GET("/notifications", func(c *gin.Context) {
		c.Set("userID", 1)
		c.Next()
	}, handler.GetNotifications)

	// Make request
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/notifications", nil)
	router.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"success":true`)
	assert.Contains(t, w.Body.String(), "Test Notification")
	mockRepo.AssertExpectations(t)
}

// TestGetNotifications_WithFilters
func TestGetNotifications_WithFilters(t *testing.T) {
	mockRepo := new(MockNotificationRepository)
	handler := NewNotificationHandler(mockRepo)
	router := setupNotificationTestRouter()

	expectedResponse := &repository.NotificationsResponse{
		Notifications: []repository.Notification{},
		Pagination: repository.Pagination{
			CurrentPage:  1,
			TotalPages:   0,
			TotalItems:   0,
			ItemsPerPage: 10,
		},
		UnreadCount: 0,
	}

	// Expect call with specific filters
	mockRepo.On("GetNotifications", 1, 10, 1, true, "schedule").Return(expectedResponse, nil)

	router.GET("/notifications", func(c *gin.Context) {
		c.Set("userID", 1)
		c.Next()
	}, handler.GetNotifications)

	// Make request with query params
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/notifications?limit=10&page=1&unreadOnly=true&type=schedule", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockRepo.AssertExpectations(t)
}

// TestGetNotifications_Unauthorized
func TestGetNotifications_Unauthorized(t *testing.T) {
	mockRepo := new(MockNotificationRepository)
	handler := NewNotificationHandler(mockRepo)
	router := setupNotificationTestRouter()

	// No userID set in context
	router.GET("/notifications", handler.GetNotifications)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/notifications", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "UNAUTHORIZED")
}

// TestGetNotifications_InternalError
func TestGetNotifications_InternalError(t *testing.T) {
	mockRepo := new(MockNotificationRepository)
	handler := NewNotificationHandler(mockRepo)
	router := setupNotificationTestRouter()

	mockRepo.On("GetNotifications", 1, 20, 1, false, "").Return(nil, errors.New("database error"))

	router.GET("/notifications", func(c *gin.Context) {
		c.Set("userID", 1)
		c.Next()
	}, handler.GetNotifications)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/notifications", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.Contains(t, w.Body.String(), "INTERNAL_ERROR")
	mockRepo.AssertExpectations(t)
}

// TestMarkAsRead_Success
func TestMarkAsRead_Success(t *testing.T) {
	mockRepo := new(MockNotificationRepository)
	handler := NewNotificationHandler(mockRepo)
	router := setupNotificationTestRouter()

	mockRepo.On("MarkAsRead", 1, 1).Return(nil)

	router.PUT("/notifications/:id/read", func(c *gin.Context) {
		c.Set("userID", 1)
		c.Next()
	}, handler.MarkAsRead)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/notifications/1/read", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"success":true`)
	assert.Contains(t, w.Body.String(), "อ่านการแจ้งเตือนแล้ว")
	mockRepo.AssertExpectations(t)
}

// TestMarkAsRead_NotFound
func TestMarkAsRead_NotFound(t *testing.T) {
	mockRepo := new(MockNotificationRepository)
	handler := NewNotificationHandler(mockRepo)
	router := setupNotificationTestRouter()

	mockRepo.On("MarkAsRead", 999, 1).Return(errors.New("ไม่พบการแจ้งเตือนนี้หรือคุณไม่มีสิทธิ์เข้าถึง"))

	router.PUT("/notifications/:id/read", func(c *gin.Context) {
		c.Set("userID", 1)
		c.Next()
	}, handler.MarkAsRead)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/notifications/999/read", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	assert.Contains(t, w.Body.String(), "NOT_FOUND")
	mockRepo.AssertExpectations(t)
}

// TestMarkAsRead_InvalidID
func TestMarkAsRead_InvalidID(t *testing.T) {
	mockRepo := new(MockNotificationRepository)
	handler := NewNotificationHandler(mockRepo)
	router := setupNotificationTestRouter()

	router.PUT("/notifications/:id/read", func(c *gin.Context) {
		c.Set("userID", 1)
		c.Next()
	}, handler.MarkAsRead)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/notifications/invalid/read", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "INVALID_INPUT")
}

// TestMarkAsRead_Unauthorized
func TestMarkAsRead_Unauthorized(t *testing.T) {
	mockRepo := new(MockNotificationRepository)
	handler := NewNotificationHandler(mockRepo)
	router := setupNotificationTestRouter()

	router.PUT("/notifications/:id/read", handler.MarkAsRead)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/notifications/1/read", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// TestMarkAllAsRead_Success
func TestMarkAllAsRead_Success(t *testing.T) {
	mockRepo := new(MockNotificationRepository)
	handler := NewNotificationHandler(mockRepo)
	router := setupNotificationTestRouter()

	mockRepo.On("MarkAllAsRead", 1).Return(15, nil)

	router.PUT("/notifications/read-all", func(c *gin.Context) {
		c.Set("userID", 1)
		c.Next()
	}, handler.MarkAllAsRead)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/notifications/read-all", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), `"success":true`)
	assert.Contains(t, w.Body.String(), "อ่านการแจ้งเตือนทั้งหมดแล้ว")
	assert.Contains(t, w.Body.String(), `"markedCount":15`)
	mockRepo.AssertExpectations(t)
}

// TestMarkAllAsRead_Unauthorized
func TestMarkAllAsRead_Unauthorized(t *testing.T) {
	mockRepo := new(MockNotificationRepository)
	handler := NewNotificationHandler(mockRepo)
	router := setupNotificationTestRouter()

	router.PUT("/notifications/read-all", handler.MarkAllAsRead)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/notifications/read-all", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

// TestMarkAllAsRead_InternalError
func TestMarkAllAsRead_InternalError(t *testing.T) {
	mockRepo := new(MockNotificationRepository)
	handler := NewNotificationHandler(mockRepo)
	router := setupNotificationTestRouter()

	mockRepo.On("MarkAllAsRead", 1).Return(0, errors.New("database error"))

	router.PUT("/notifications/read-all", func(c *gin.Context) {
		c.Set("userID", 1)
		c.Next()
	}, handler.MarkAllAsRead)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/notifications/read-all", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.Contains(t, w.Body.String(), "INTERNAL_ERROR")
	mockRepo.AssertExpectations(t)
}
