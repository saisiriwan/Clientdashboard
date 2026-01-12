package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Schedule represents a training session schedule
type Schedule struct {
	ID                   uint   `gorm:"primaryKey" json:"id"`
	TrainerID            uint   `gorm:"not null;index" json:"trainerId"`
	TraineeID            uint   `gorm:"not null;index" json:"traineeId"`
	LocationID           *uint  `json:"locationId"`
	ProgramAssignmentID  *uint  `json:"programAssignmentId"`
	
	// Schedule Info
	Date     time.Time `gorm:"not null;index" json:"date"` // YYYY-MM-DD
	Time     string    `gorm:"type:time;not null" json:"time"` // HH:MM
	Duration int       `gorm:"not null" json:"duration"` // minutes
	Title    string    `gorm:"not null" json:"title"`
	Description *string `gorm:"type:text" json:"description"`
	
	// Session Type
	SessionType       *string        `gorm:"type:varchar(50)" json:"sessionType"` // 'Strength Training', 'Cardio'
	PlannedExercises  pq.StringArray `gorm:"type:text[]" json:"plannedExercises"` // ['Squat', 'Deadlift']
	
	// Status
	Status string `gorm:"type:varchar(20);default:'scheduled';index" json:"status"` // 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
	
	// Notes
	Notes              *string    `gorm:"type:text" json:"notes"`
	CancellationReason *string    `gorm:"type:text" json:"cancellationReason"`
	CancelledAt        *time.Time `json:"cancelledAt"`
	CancelledBy        *uint      `json:"cancelledBy"` // user_id
	
	// Related
	SessionCardID *uint `json:"sessionCardId"` // Link to session_cards after completion
	
	// Reminders
	ReminderSent   bool       `gorm:"default:false" json:"reminderSent"`
	ReminderSentAt *time.Time `json:"reminderSentAt"`
	
	// Timestamps
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	Trainer           Trainer            `gorm:"foreignKey:TrainerID" json:"trainer"`
	Trainee           Trainee            `gorm:"foreignKey:TraineeID" json:"trainee"`
	Location          *Location          `gorm:"foreignKey:LocationID" json:"location,omitempty"`
	ProgramAssignment *ProgramAssignment `gorm:"foreignKey:ProgramAssignmentID" json:"-"`
	SessionCard       *SessionCard       `gorm:"foreignKey:SessionCardID" json:"-"`
}

// TableName specifies the table name
func (Schedule) TableName() string {
	return "schedules"
}

// IsUpcoming checks if schedule is upcoming
func (s *Schedule) IsUpcoming() bool {
	now := time.Now()
	scheduleTime := time.Date(
		s.Date.Year(), s.Date.Month(), s.Date.Day(),
		0, 0, 0, 0, s.Date.Location(),
	)
	return scheduleTime.After(now) || scheduleTime.Equal(now.Truncate(24*time.Hour))
}

// CanBeCancelled checks if schedule can be cancelled
func (s *Schedule) CanBeCancelled() bool {
	return s.Status == "scheduled" || s.Status == "confirmed"
}

// CanBeCompleted checks if schedule can be marked as completed
func (s *Schedule) CanBeCompleted() bool {
	return s.Status == "confirmed" && !s.IsUpcoming()
}
