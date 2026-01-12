package repository

import (
	"fitness-training-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

// ScheduleRepository handles schedule data access
type ScheduleRepository interface {
	// Read operations (Trainee can use these)
	FindByID(id uint) (*models.Schedule, error)
	FindByTraineeID(traineeID uint, filters map[string]interface{}) ([]models.Schedule, error)
	FindUpcoming(traineeID uint, days int) ([]models.Schedule, error)
	
	// Write operations (Trainer only)
	Create(schedule *models.Schedule) error
	Update(schedule *models.Schedule) error
	Delete(id uint) error
	
	// Trainer operations
	FindByTrainerID(trainerID uint, filters map[string]interface{}) ([]models.Schedule, error)
	CheckConflict(trainerID uint, date time.Time, timeStr string, duration int, excludeID *uint) (bool, error)
}

type scheduleRepository struct {
	db *gorm.DB
}

// NewScheduleRepository creates a new schedule repository
func NewScheduleRepository(db *gorm.DB) ScheduleRepository {
	return &scheduleRepository{db: db}
}

// FindByID finds schedule by ID with preloaded relations
func (r *scheduleRepository) FindByID(id uint) (*models.Schedule, error) {
	var schedule models.Schedule
	err := r.db.
		Preload("Trainer.User").
		Preload("Trainee.User").
		Preload("Location").
		First(&schedule, id).Error
	if err != nil {
		return nil, err
	}
	return &schedule, nil
}

// FindByTraineeID finds schedules for a trainee (READ-ONLY for trainee)
func (r *scheduleRepository) FindByTraineeID(traineeID uint, filters map[string]interface{}) ([]models.Schedule, error) {
	query := r.db.
		Preload("Trainer.User").
		Preload("Location").
		Where("trainee_id = ?", traineeID)
	
	// Apply filters
	if fromDate, ok := filters["fromDate"].(time.Time); ok {
		query = query.Where("date >= ?", fromDate)
	}
	if toDate, ok := filters["toDate"].(time.Time); ok {
		query = query.Where("date <= ?", toDate)
	}
	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}
	
	var schedules []models.Schedule
	err := query.Order("date ASC, time ASC").Find(&schedules).Error
	return schedules, err
}

// FindUpcoming finds upcoming schedules for trainee (next N days)
func (r *scheduleRepository) FindUpcoming(traineeID uint, days int) ([]models.Schedule, error) {
	now := time.Now()
	endDate := now.AddDate(0, 0, days)
	
	var schedules []models.Schedule
	err := r.db.
		Preload("Trainer.User").
		Preload("Location").
		Where("trainee_id = ? AND date BETWEEN ? AND ? AND status IN ?", 
			traineeID, now, endDate, []string{"scheduled", "confirmed"}).
		Order("date ASC, time ASC").
		Find(&schedules).Error
	
	return schedules, err
}

// Create creates a new schedule (Trainer only)
func (r *scheduleRepository) Create(schedule *models.Schedule) error {
	return r.db.Create(schedule).Error
}

// Update updates schedule (Trainer only)
func (r *scheduleRepository) Update(schedule *models.Schedule) error {
	return r.db.Save(schedule).Error
}

// Delete soft deletes schedule (Trainer only)
func (r *scheduleRepository) Delete(id uint) error {
	return r.db.Delete(&models.Schedule{}, id).Error
}

// FindByTrainerID finds schedules for a trainer
func (r *scheduleRepository) FindByTrainerID(trainerID uint, filters map[string]interface{}) ([]models.Schedule, error) {
	query := r.db.
		Preload("Trainee.User").
		Preload("Location").
		Where("trainer_id = ?", trainerID)
	
	// Apply filters
	if fromDate, ok := filters["fromDate"].(time.Time); ok {
		query = query.Where("date >= ?", fromDate)
	}
	if toDate, ok := filters["toDate"].(time.Time); ok {
		query = query.Where("date <= ?", toDate)
	}
	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}
	
	var schedules []models.Schedule
	err := query.Order("date ASC, time ASC").Find(&schedules).Error
	return schedules, err
}

// CheckConflict checks if there's a scheduling conflict
func (r *scheduleRepository) CheckConflict(trainerID uint, date time.Time, timeStr string, duration int, excludeID *uint) (bool, error) {
	query := r.db.Model(&models.Schedule{}).
		Where("trainer_id = ? AND date = ? AND status NOT IN ?", 
			trainerID, date, []string{"cancelled", "completed"})
	
	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}
	
	var count int64
	err := query.Count(&count).Error
	
	// TODO: Implement proper time overlap check
	// For now, just check if there's any session on the same day
	
	return count > 0, err
}
