package repository

import (
	"fitness-training-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

// TraineeRepository handles trainee data access (READ-ONLY for trainee user)
type TraineeRepository interface {
	// Read operations (for trainee)
	FindByID(id uint) (*models.Trainee, error)
	FindByUserID(userID uint) (*models.Trainee, error)
	
	// Write operations (for trainer only)
	Create(trainee *models.Trainee) error
	Update(trainee *models.Trainee) error
	Delete(id uint) error
	
	// Stats
	GetStats(traineeID uint) (map[string]interface{}, error)
	UpdateStats(traineeID uint) error
}

type traineeRepository struct {
	db *gorm.DB
}

// NewTraineeRepository creates a new trainee repository
func NewTraineeRepository(db *gorm.DB) TraineeRepository {
	return &traineeRepository{db: db}
}

// FindByID finds trainee by ID
func (r *traineeRepository) FindByID(id uint) (*models.Trainee, error) {
	var trainee models.Trainee
	err := r.db.Preload("User").Preload("Trainer.User").First(&trainee, id).Error
	if err != nil {
		return nil, err
	}
	return &trainee, nil
}

// FindByUserID finds trainee by user ID
func (r *traineeRepository) FindByUserID(userID uint) (*models.Trainee, error) {
	var trainee models.Trainee
	err := r.db.Preload("User").Preload("Trainer.User").Where("user_id = ?", userID).First(&trainee).Error
	if err != nil {
		return nil, err
	}
	return &trainee, nil
}

// Create creates a new trainee (Trainer only)
func (r *traineeRepository) Create(trainee *models.Trainee) error {
	return r.db.Create(trainee).Error
}

// Update updates trainee (Trainer only)
func (r *traineeRepository) Update(trainee *models.Trainee) error {
	return r.db.Save(trainee).Error
}

// Delete soft deletes trainee (Trainer only)
func (r *traineeRepository) Delete(id uint) error {
	return r.db.Delete(&models.Trainee{}, id).Error
}

// GetStats gets trainee statistics
func (r *traineeRepository) GetStats(traineeID uint) (map[string]interface{}, error) {
	var trainee models.Trainee
	err := r.db.First(&trainee, traineeID).Error
	if err != nil {
		return nil, err
	}
	
	// Count upcoming sessions
	var upcomingSessions int64
	r.db.Model(&models.Schedule{}).
		Where("trainee_id = ? AND date >= ? AND status IN ?", 
			traineeID, time.Now(), []string{"scheduled", "confirmed"}).
		Count(&upcomingSessions)
	
	stats := map[string]interface{}{
		"totalSessions":     trainee.TotalSessions,
		"completedSessions": trainee.CompletedSessions,
		"cancelledSessions": trainee.CancelledSessions,
		"currentStreak":     trainee.CurrentStreak,
		"longestStreak":     trainee.LongestStreak,
		"totalWorkoutHours": trainee.TotalWorkoutHours,
		"upcomingSessions":  upcomingSessions,
		"lastSessionDate":   trainee.LastSessionDate,
	}
	
	return stats, nil
}

// UpdateStats updates trainee statistics (called after session completion)
func (r *traineeRepository) UpdateStats(traineeID uint) error {
	// Count total sessions
	var totalSessions int64
	r.db.Model(&models.SessionCard{}).Where("trainee_id = ?", traineeID).Count(&totalSessions)
	
	// Count completed sessions
	var completedSessions int64
	r.db.Model(&models.Schedule{}).
		Where("trainee_id = ? AND status = ?", traineeID, "completed").
		Count(&completedSessions)
	
	// Count cancelled sessions
	var cancelledSessions int64
	r.db.Model(&models.Schedule{}).
		Where("trainee_id = ? AND status = ?", traineeID, "cancelled").
		Count(&cancelledSessions)
	
	// Get total workout hours
	var totalMinutes int64
	r.db.Model(&models.SessionCard{}).
		Where("trainee_id = ?", traineeID).
		Select("COALESCE(SUM(duration), 0)").
		Scan(&totalMinutes)
	
	// Get last session date
	var lastSessionDate *time.Time
	r.db.Model(&models.SessionCard{}).
		Where("trainee_id = ?", traineeID).
		Select("MAX(date)").
		Scan(&lastSessionDate)
	
	// Calculate streak (simplified - count consecutive days)
	currentStreak := 0
	// TODO: Implement streak calculation logic
	
	// Update trainee
	return r.db.Model(&models.Trainee{}).Where("id = ?", traineeID).Updates(map[string]interface{}{
		"total_sessions":      totalSessions,
		"completed_sessions":  completedSessions,
		"cancelled_sessions":  cancelledSessions,
		"total_workout_hours": float32(totalMinutes) / 60.0,
		"last_session_date":   lastSessionDate,
		"current_streak":      currentStreak,
	}).Error
}
