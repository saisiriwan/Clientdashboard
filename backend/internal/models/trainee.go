package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Trainee represents a fitness trainee (client)
type Trainee struct {
	ID        uint  `gorm:"primaryKey" json:"id"`
	UserID    uint  `gorm:"uniqueIndex;not null" json:"userId"`
	TrainerID *uint `json:"trainerId"` // Assigned trainer (nullable)
	
	// Physical Info
	Height float32 `gorm:"type:decimal(5,2)" json:"height"` // cm
	Weight float32 `gorm:"type:decimal(5,2)" json:"weight"` // kg
	
	// Goals
	Goals        pq.StringArray `gorm:"type:text[]" json:"goals"` // ['เพิ่มกล้ามเนื้อ 5kg']
	FitnessLevel *string        `gorm:"type:varchar(20)" json:"fitnessLevel"` // 'beginner', 'intermediate', 'advanced'
	
	// Medical Info
	MedicalNotes *string        `gorm:"type:text" json:"medicalNotes"`
	Injuries     pq.StringArray `gorm:"type:text[]" json:"injuries"`
	Allergies    pq.StringArray `gorm:"type:text[]" json:"allergies"`
	
	// Emergency Contact
	EmergencyContactName         *string `gorm:"type:varchar(255)" json:"emergencyContactName"`
	EmergencyContactPhone        *string `gorm:"type:varchar(20)" json:"emergencyContactPhone"`
	EmergencyContactRelationship *string `gorm:"type:varchar(50)" json:"emergencyContactRelationship"`
	
	// Membership
	JoinDate          time.Time  `gorm:"default:CURRENT_DATE" json:"joinDate"`
	MembershipType    *string    `gorm:"type:varchar(50)" json:"membershipType"` // 'monthly', 'quarterly', 'yearly'
	MembershipExpiry  *time.Time `json:"membershipExpiry"`
	Status            string     `gorm:"type:varchar(20);default:'active'" json:"status"` // 'active', 'inactive', 'suspended'
	
	// Stats (Cached for performance)
	TotalSessions      int     `gorm:"default:0" json:"totalSessions"`
	CompletedSessions  int     `gorm:"default:0" json:"completedSessions"`
	CancelledSessions  int     `gorm:"default:0" json:"cancelledSessions"`
	CurrentStreak      int     `gorm:"default:0" json:"currentStreak"`
	LongestStreak      int     `gorm:"default:0" json:"longestStreak"`
	TotalWorkoutHours  float32 `gorm:"type:decimal(10,2);default:0.00" json:"totalWorkoutHours"`
	LastSessionDate    *time.Time `json:"lastSessionDate"`
	
	// Timestamps
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	User               User                 `gorm:"foreignKey:UserID" json:"user"`
	Trainer            *Trainer             `gorm:"foreignKey:TrainerID" json:"trainer,omitempty"`
	ProgramAssignments []ProgramAssignment  `gorm:"foreignKey:TraineeID" json:"-"`
	Schedules          []Schedule           `gorm:"foreignKey:TraineeID" json:"-"`
	SessionCards       []SessionCard        `gorm:"foreignKey:TraineeID" json:"-"`
	Metrics            []Metric             `gorm:"foreignKey:TraineeID" json:"-"`
	Achievements       []Achievement        `gorm:"foreignKey:TraineeID" json:"-"`
}

// TableName specifies the table name
func (Trainee) TableName() string {
	return "trainees"
}

// GetActiveProgramAssignment returns active program assignment
func (t *Trainee) GetActiveProgramAssignment(db *gorm.DB) (*ProgramAssignment, error) {
	var assignment ProgramAssignment
	err := db.Where("trainee_id = ? AND status = ?", t.ID, "active").
		Preload("Program").
		First(&assignment).Error
	if err != nil {
		return nil, err
	}
	return &assignment, nil
}
