package repository

import (
	"fitness-training-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

// ==========================================
// TRAINER REPOSITORY
// ==========================================

type TrainerRepository interface {
	FindByID(id uint) (*models.Trainer, error)
	FindByUserID(userID uint) (*models.Trainer, error)
	FindAll(filters map[string]interface{}) ([]models.Trainer, error)
	Create(trainer *models.Trainer) error
	Update(trainer *models.Trainer) error
	GetClients(trainerID uint) ([]models.Trainee, error)
}

type trainerRepository struct {
	db *gorm.DB
}

func NewTrainerRepository(db *gorm.DB) TrainerRepository {
	return &trainerRepository{db: db}
}

func (r *trainerRepository) FindByID(id uint) (*models.Trainer, error) {
	var trainer models.Trainer
	err := r.db.Preload("User").First(&trainer, id).Error
	return &trainer, err
}

func (r *trainerRepository) FindByUserID(userID uint) (*models.Trainer, error) {
	var trainer models.Trainer
	err := r.db.Preload("User").Where("user_id = ?", userID).First(&trainer).Error
	return &trainer, err
}

func (r *trainerRepository) FindAll(filters map[string]interface{}) ([]models.Trainer, error) {
	query := r.db.Preload("User")
	
	if availability, ok := filters["availability"].(string); ok && availability != "" {
		query = query.Where("availability = ?", availability)
	}
	
	var trainers []models.Trainer
	err := query.Find(&trainers).Error
	return trainers, err
}

func (r *trainerRepository) Create(trainer *models.Trainer) error {
	return r.db.Create(trainer).Error
}

func (r *trainerRepository) Update(trainer *models.Trainer) error {
	return r.db.Save(trainer).Error
}

func (r *trainerRepository) GetClients(trainerID uint) ([]models.Trainee, error) {
	var trainees []models.Trainee
	err := r.db.Preload("User").Where("trainer_id = ?", trainerID).Find(&trainees).Error
	return trainees, err
}

// ==========================================
// PROGRAM REPOSITORY
// ==========================================

type ProgramRepository interface {
	FindByID(id uint) (*models.Program, error)
	FindByTrainerID(trainerID uint) ([]models.Program, error)
	Create(program *models.Program) error
	Update(program *models.Program) error
	Delete(id uint) error
	
	// Program Assignments
	FindAssignmentByID(id uint) (*models.ProgramAssignment, error)
	FindActiveAssignmentByTraineeID(traineeID uint) (*models.ProgramAssignment, error)
	FindAssignmentsByTraineeID(traineeID uint) ([]models.ProgramAssignment, error)
	CreateAssignment(assignment *models.ProgramAssignment) error
	UpdateAssignment(assignment *models.ProgramAssignment) error
}

type programRepository struct {
	db *gorm.DB
}

func NewProgramRepository(db *gorm.DB) ProgramRepository {
	return &programRepository{db: db}
}

func (r *programRepository) FindByID(id uint) (*models.Program, error) {
	var program models.Program
	err := r.db.Preload("Trainer.User").First(&program, id).Error
	return &program, err
}

func (r *programRepository) FindByTrainerID(trainerID uint) ([]models.Program, error) {
	var programs []models.Program
	err := r.db.Where("trainer_id = ?", trainerID).Find(&programs).Error
	return programs, err
}

func (r *programRepository) Create(program *models.Program) error {
	return r.db.Create(program).Error
}

func (r *programRepository) Update(program *models.Program) error {
	return r.db.Save(program).Error
}

func (r *programRepository) Delete(id uint) error {
	return r.db.Delete(&models.Program{}, id).Error
}

func (r *programRepository) FindAssignmentByID(id uint) (*models.ProgramAssignment, error) {
	var assignment models.ProgramAssignment
	err := r.db.Preload("Program").Preload("Trainee.User").First(&assignment, id).Error
	return &assignment, err
}

func (r *programRepository) FindActiveAssignmentByTraineeID(traineeID uint) (*models.ProgramAssignment, error) {
	var assignment models.ProgramAssignment
	err := r.db.Preload("Program.Trainer.User").
		Where("trainee_id = ? AND status = ?", traineeID, "active").
		First(&assignment).Error
	return &assignment, err
}

func (r *programRepository) FindAssignmentsByTraineeID(traineeID uint) ([]models.ProgramAssignment, error) {
	var assignments []models.ProgramAssignment
	err := r.db.Preload("Program").Where("trainee_id = ?", traineeID).
		Order("created_at DESC").Find(&assignments).Error
	return assignments, err
}

func (r *programRepository) CreateAssignment(assignment *models.ProgramAssignment) error {
	return r.db.Create(assignment).Error
}

func (r *programRepository) UpdateAssignment(assignment *models.ProgramAssignment) error {
	return r.db.Save(assignment).Error
}

// ==========================================
// SESSION CARD REPOSITORY
// ==========================================

type SessionCardRepository interface {
	FindByID(id uint) (*models.SessionCard, error)
	FindByTraineeID(traineeID uint, limit, offset int) ([]models.SessionCard, int64, error)
	FindByTrainerID(trainerID uint, limit, offset int) ([]models.SessionCard, int64, error)
	Search(traineeID uint, filters map[string]interface{}) ([]models.SessionCard, error)
	Create(sessionCard *models.SessionCard) error
	Update(sessionCard *models.SessionCard) error
	Delete(id uint) error
}

type sessionCardRepository struct {
	db *gorm.DB
}

func NewSessionCardRepository(db *gorm.DB) SessionCardRepository {
	return &sessionCardRepository{db: db}
}

func (r *sessionCardRepository) FindByID(id uint) (*models.SessionCard, error) {
	var sessionCard models.SessionCard
	err := r.db.
		Preload("Trainer.User").
		Preload("Trainee.User").
		Preload("Exercises.Sets").
		First(&sessionCard, id).Error
	return &sessionCard, err
}

func (r *sessionCardRepository) FindByTraineeID(traineeID uint, limit, offset int) ([]models.SessionCard, int64, error) {
	var sessionCards []models.SessionCard
	var total int64
	
	query := r.db.Model(&models.SessionCard{}).Where("trainee_id = ?", traineeID)
	query.Count(&total)
	
	err := query.
		Preload("Trainer.User").
		Preload("Exercises").
		Order("date DESC").
		Limit(limit).
		Offset(offset).
		Find(&sessionCards).Error
	
	return sessionCards, total, err
}

func (r *sessionCardRepository) FindByTrainerID(trainerID uint, limit, offset int) ([]models.SessionCard, int64, error) {
	var sessionCards []models.SessionCard
	var total int64
	
	query := r.db.Model(&models.SessionCard{}).Where("trainer_id = ?", trainerID)
	query.Count(&total)
	
	err := query.
		Preload("Trainee.User").
		Preload("Exercises").
		Order("date DESC").
		Limit(limit).
		Offset(offset).
		Find(&sessionCards).Error
	
	return sessionCards, total, err
}

func (r *sessionCardRepository) Search(traineeID uint, filters map[string]interface{}) ([]models.SessionCard, error) {
	query := r.db.Preload("Trainer.User").Preload("Exercises").
		Where("trainee_id = ?", traineeID)
	
	if fromDate, ok := filters["fromDate"].(time.Time); ok {
		query = query.Where("date >= ?", fromDate)
	}
	if toDate, ok := filters["toDate"].(time.Time); ok {
		query = query.Where("date <= ?", toDate)
	}
	
	var sessionCards []models.SessionCard
	err := query.Order("date DESC").Find(&sessionCards).Error
	return sessionCards, err
}

func (r *sessionCardRepository) Create(sessionCard *models.SessionCard) error {
	return r.db.Create(sessionCard).Error
}

func (r *sessionCardRepository) Update(sessionCard *models.SessionCard) error {
	return r.db.Save(sessionCard).Error
}

func (r *sessionCardRepository) Delete(id uint) error {
	return r.db.Delete(&models.SessionCard{}, id).Error
}

// ==========================================
// NOTIFICATION REPOSITORY
// ==========================================

type NotificationRepository interface {
	FindByUserID(userID uint, limit, offset int) ([]models.Notification, int64, error)
	FindUnreadByUserID(userID uint) ([]models.Notification, error)
	CountUnread(userID uint) (int64, error)
	Create(notification *models.Notification) error
	MarkAsRead(id uint) error
	MarkAllAsRead(userID uint) error
}

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) FindByUserID(userID uint, limit, offset int) ([]models.Notification, int64, error) {
	var notifications []models.Notification
	var total int64
	
	query := r.db.Model(&models.Notification{}).Where("user_id = ?", userID)
	query.Count(&total)
	
	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&notifications).Error
	return notifications, total, err
}

func (r *notificationRepository) FindUnreadByUserID(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	err := r.db.Where("user_id = ? AND is_read = ?", userID, false).
		Order("created_at DESC").Find(&notifications).Error
	return notifications, err
}

func (r *notificationRepository) CountUnread(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count).Error
	return count, err
}

func (r *notificationRepository) Create(notification *models.Notification) error {
	return r.db.Create(notification).Error
}

func (r *notificationRepository) MarkAsRead(id uint) error {
	now := time.Now()
	return r.db.Model(&models.Notification{}).Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		}).Error
}

func (r *notificationRepository) MarkAllAsRead(userID uint) error {
	now := time.Now()
	return r.db.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		}).Error
}

// ==========================================
// METRIC REPOSITORY
// ==========================================

type MetricRepository interface {
	FindByTraineeID(traineeID uint, metricType *string) ([]models.Metric, error)
	Create(metric *models.Metric) error
}

type metricRepository struct {
	db *gorm.DB
}

func NewMetricRepository(db *gorm.DB) MetricRepository {
	return &metricRepository{db: db}
}

func (r *metricRepository) FindByTraineeID(traineeID uint, metricType *string) ([]models.Metric, error) {
	query := r.db.Where("trainee_id = ?", traineeID)
	
	if metricType != nil && *metricType != "" {
		query = query.Where("type = ?", *metricType)
	}
	
	var metrics []models.Metric
	err := query.Order("date DESC").Find(&metrics).Error
	return metrics, err
}

func (r *metricRepository) Create(metric *models.Metric) error {
	return r.db.Create(metric).Error
}

// ==========================================
// LOCATION REPOSITORY
// ==========================================

type LocationRepository interface {
	FindAll() ([]models.Location, error)
	FindByID(id uint) (*models.Location, error)
	FindActive() ([]models.Location, error)
}

type locationRepository struct {
	db *gorm.DB
}

func NewLocationRepository(db *gorm.DB) LocationRepository {
	return &locationRepository{db: db}
}

func (r *locationRepository) FindAll() ([]models.Location, error) {
	var locations []models.Location
	err := r.db.Find(&locations).Error
	return locations, err
}

func (r *locationRepository) FindByID(id uint) (*models.Location, error) {
	var location models.Location
	err := r.db.First(&location, id).Error
	return &location, err
}

func (r *locationRepository) FindActive() ([]models.Location, error) {
	var locations []models.Location
	err := r.db.Where("is_active = ?", true).Find(&locations).Error
	return locations, err
}
