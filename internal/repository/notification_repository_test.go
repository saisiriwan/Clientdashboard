package repository

import (
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

// TestGetNotifications_Success
func TestGetNotifications_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewNotificationRepository(db)

	// Mock COUNT query
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM notifications WHERE user_id = \\$1").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(2))

	// Mock SELECT query
	rows := sqlmock.NewRows([]string{
		"id", "type", "title", "message", "related_id", "related_type",
		"action_url", "priority", "is_read", "created_at",
	}).
		AddRow(1, "schedule", "Test Notification 1", "Message 1", 1, "schedule", "/schedules/1", "high", false, "2026-01-10T08:00:00Z").
		AddRow(2, "progress", "Test Notification 2", "Message 2", nil, "", "", "medium", true, "2026-01-09T10:00:00Z")

	mock.ExpectQuery("SELECT (.+) FROM notifications WHERE user_id = \\$1 ORDER BY created_at DESC LIMIT \\$2 OFFSET \\$3").
		WithArgs(1, 20, 0).
		WillReturnRows(rows)

	// Mock unread count query
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM notifications WHERE user_id = \\$1 AND is_read = false").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

	// Execute
	response, err := repo.GetNotifications(1, 20, 1, false, "")

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.Equal(t, 2, len(response.Notifications))
	assert.Equal(t, "Test Notification 1", response.Notifications[0].Title)
	assert.Equal(t, "schedule", response.Notifications[0].Type)
	assert.Equal(t, false, response.Notifications[0].IsRead)
	assert.Equal(t, 1, response.UnreadCount)
	assert.Equal(t, 1, response.Pagination.CurrentPage)
	assert.Equal(t, 2, response.Pagination.TotalItems)

	// Verify all expectations were met
	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestGetNotifications_WithFilters
func TestGetNotifications_WithFilters(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewNotificationRepository(db)

	// Mock COUNT query with filters
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM notifications WHERE user_id = \\$1 AND type = \\$2").
		WithArgs(1, "schedule").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

	// Mock SELECT query with filters
	rows := sqlmock.NewRows([]string{
		"id", "type", "title", "message", "related_id", "related_type",
		"action_url", "priority", "is_read", "created_at",
	}).
		AddRow(1, "schedule", "Test Schedule", "Message", 1, "schedule", "/schedules/1", "high", false, "2026-01-10T08:00:00Z")

	mock.ExpectQuery("SELECT (.+) FROM notifications WHERE user_id = \\$1 AND type = \\$2 ORDER BY created_at DESC").
		WithArgs(1, "schedule", 10, 0).
		WillReturnRows(rows)

	// Mock unread count
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM notifications WHERE user_id = \\$1 AND is_read = false").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

	// Execute
	response, err := repo.GetNotifications(1, 10, 1, false, "schedule")

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.Equal(t, 1, len(response.Notifications))
	assert.Equal(t, "schedule", response.Notifications[0].Type)

	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestMarkAsRead_Success
func TestMarkAsRead_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewNotificationRepository(db)

	// Mock UPDATE query
	mock.ExpectExec("UPDATE notifications SET is_read = true WHERE id = \\$1 AND user_id = \\$2").
		WithArgs(1, 1).
		WillReturnResult(sqlmock.NewResult(0, 1)) // 1 row affected

	// Execute
	err = repo.MarkAsRead(1, 1)

	// Assertions
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestMarkAsRead_NotFound
func TestMarkAsRead_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewNotificationRepository(db)

	// Mock UPDATE query - no rows affected
	mock.ExpectExec("UPDATE notifications SET is_read = true WHERE id = \\$1 AND user_id = \\$2").
		WithArgs(999, 1).
		WillReturnResult(sqlmock.NewResult(0, 0)) // 0 rows affected

	// Execute
	err = repo.MarkAsRead(999, 1)

	// Assertions
	assert.Error(t, err)
	assert.Equal(t, "ไม่พบการแจ้งเตือนนี้หรือคุณไม่มีสิทธิ์เข้าถึง", err.Error())
	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestMarkAllAsRead_Success
func TestMarkAllAsRead_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewNotificationRepository(db)

	// Mock UPDATE query
	mock.ExpectExec("UPDATE notifications SET is_read = true WHERE user_id = \\$1 AND is_read = false").
		WithArgs(1).
		WillReturnResult(sqlmock.NewResult(0, 15)) // 15 rows affected

	// Execute
	count, err := repo.MarkAllAsRead(1)

	// Assertions
	assert.NoError(t, err)
	assert.Equal(t, 15, count)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestMarkAllAsRead_NoUnreadNotifications
func TestMarkAllAsRead_NoUnreadNotifications(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewNotificationRepository(db)

	// Mock UPDATE query - no rows affected
	mock.ExpectExec("UPDATE notifications SET is_read = true WHERE user_id = \\$1 AND is_read = false").
		WithArgs(1).
		WillReturnResult(sqlmock.NewResult(0, 0))

	// Execute
	count, err := repo.MarkAllAsRead(1)

	// Assertions
	assert.NoError(t, err)
	assert.Equal(t, 0, count)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestGetUnreadCount_Success
func TestGetUnreadCount_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewNotificationRepository(db)

	// Mock SELECT COUNT query
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM notifications WHERE user_id = \\$1 AND is_read = false").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(5))

	// Execute
	count, err := repo.GetUnreadCount(1)

	// Assertions
	assert.NoError(t, err)
	assert.Equal(t, 5, count)
	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestCreateNotification_Success
func TestCreateNotification_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewNotificationRepository(db)

	input := CreateNotificationInput{
		UserID:      1,
		Type:        "schedule",
		Title:       "New Notification",
		Message:     "Test message",
		RelatedID:   nil,
		RelatedType: "",
		ActionURL:   "/schedules/1",
		Priority:    "high",
	}

	// Mock INSERT query
	mock.ExpectExec("INSERT INTO notifications").
		WithArgs(input.UserID, input.Type, input.Title, input.Message, input.RelatedID, input.RelatedType, input.ActionURL, input.Priority).
		WillReturnResult(sqlmock.NewResult(1, 1))

	// Execute
	err = repo.CreateNotification(input)

	// Assertions
	assert.NoError(t, err)
	assert.NoError(t, mock.ExpectationsWereMet())
}
