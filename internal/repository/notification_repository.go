package repository

import (
	"database/sql"
	"fmt"
)

type NotificationRepository struct {
	db *sql.DB
}

func NewNotificationRepository(db *sql.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

// ==========================================
// 5. GET /api/notifications
// ดึงการแจ้งเตือนทั้งหมด
// ==========================================

type Notification struct {
	ID          int    `json:"id"`
	Type        string `json:"type"`
	Title       string `json:"title"`
	Message     string `json:"message"`
	RelatedID   *int   `json:"relatedId"`
	RelatedType string `json:"relatedType"`
	ActionURL   string `json:"actionUrl"`
	Priority    string `json:"priority"`
	IsRead      bool   `json:"isRead"`
	CreatedAt   string `json:"createdAt"`
}

type NotificationsResponse struct {
	Notifications []Notification `json:"notifications"`
	Pagination    Pagination     `json:"pagination"`
	UnreadCount   int            `json:"unreadCount"`
}

type Pagination struct {
	CurrentPage  int `json:"currentPage"`
	TotalPages   int `json:"totalPages"`
	TotalItems   int `json:"totalItems"`
	ItemsPerPage int `json:"itemsPerPage"`
}

func (r *NotificationRepository) GetNotifications(userID, limit, page int, unreadOnly bool, notifType string) (*NotificationsResponse, error) {
	// Default values
	if limit == 0 {
		limit = 20
	}
	if page == 0 {
		page = 1
	}

	offset := (page - 1) * limit

	// Build WHERE clause
	whereClause := "WHERE user_id = $1"
	args := []interface{}{userID}
	argCount := 1

	if unreadOnly {
		argCount++
		whereClause += fmt.Sprintf(" AND is_read = false")
	}

	if notifType != "" {
		argCount++
		whereClause += fmt.Sprintf(" AND type = $%d", argCount)
		args = append(args, notifType)
	}

	// Count total items
	var totalItems int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM notifications %s", whereClause)
	err := r.db.QueryRow(countQuery, args...).Scan(&totalItems)
	if err != nil {
		return nil, err
	}

	// Get notifications
	query := fmt.Sprintf(`
		SELECT 
			id, type, title, message, related_id, related_type, 
			action_url, priority, is_read, created_at
		FROM notifications
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argCount+1, argCount+2)

	args = append(args, limit, offset)
	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []Notification
	for rows.Next() {
		var n Notification
		var relatedID sql.NullInt64
		var relatedType, actionURL sql.NullString

		err := rows.Scan(
			&n.ID,
			&n.Type,
			&n.Title,
			&n.Message,
			&relatedID,
			&relatedType,
			&actionURL,
			&n.Priority,
			&n.IsRead,
			&n.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		if relatedID.Valid {
			id := int(relatedID.Int64)
			n.RelatedID = &id
		}
		n.RelatedType = relatedType.String
		n.ActionURL = actionURL.String

		notifications = append(notifications, n)
	}

	// Get unread count
	var unreadCount int
	err = r.db.QueryRow("SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false", userID).Scan(&unreadCount)
	if err != nil {
		return nil, err
	}

	// Calculate pagination
	totalPages := (totalItems + limit - 1) / limit

	return &NotificationsResponse{
		Notifications: notifications,
		Pagination: Pagination{
			CurrentPage:  page,
			TotalPages:   totalPages,
			TotalItems:   totalItems,
			ItemsPerPage: limit,
		},
		UnreadCount: unreadCount,
	}, nil
}

// ==========================================
// PUT /api/notifications/:id/read
// Mark notification as read
// ==========================================

func (r *NotificationRepository) MarkAsRead(notificationID, userID int) error {
	query := `
		UPDATE notifications 
		SET is_read = true 
		WHERE id = $1 AND user_id = $2
	`

	result, err := r.db.Exec(query, notificationID, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("ไม่พบการแจ้งเตือนนี้หรือคุณไม่มีสิทธิ์เข้าถึง")
	}

	return nil
}

// ==========================================
// PUT /api/notifications/read-all
// Mark all notifications as read
// ==========================================

func (r *NotificationRepository) MarkAllAsRead(userID int) (int, error) {
	query := `
		UPDATE notifications 
		SET is_read = true 
		WHERE user_id = $1 AND is_read = false
	`

	result, err := r.db.Exec(query, userID)
	if err != nil {
		return 0, err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, err
	}

	return int(rowsAffected), nil
}

// ==========================================
// Helper: Get Unread Count
// ==========================================

func (r *NotificationRepository) GetUnreadCount(userID int) (int, error) {
	var count int
	err := r.db.QueryRow("SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false", userID).Scan(&count)
	if err != nil {
		return 0, err
	}
	return count, nil
}

// ==========================================
// Helper: Create Notification (สำหรับ Trainer สร้างให้ Trainee)
// ==========================================

type CreateNotificationInput struct {
	UserID      int
	Type        string
	Title       string
	Message     string
	RelatedID   *int
	RelatedType string
	ActionURL   string
	Priority    string
}

func (r *NotificationRepository) CreateNotification(input CreateNotificationInput) error {
	query := `
		INSERT INTO notifications (
			user_id, type, title, message, related_id, 
			related_type, action_url, priority
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := r.db.Exec(
		query,
		input.UserID,
		input.Type,
		input.Title,
		input.Message,
		input.RelatedID,
		input.RelatedType,
		input.ActionURL,
		input.Priority,
	)

	return err
}
