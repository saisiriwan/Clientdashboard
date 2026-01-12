package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Trainer represents a fitness trainer
type Trainer struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	UserID uint `gorm:"uniqueIndex;not null" json:"userId"`
	
	// Professional Info
	Bio            *string        `gorm:"type:text" json:"bio"`
	Specialization pq.StringArray `gorm:"type:text[]" json:"specialization"` // ['Strength', 'Bodybuilding']
	Certifications pq.StringArray `gorm:"type:text[]" json:"certifications"` // ['NASM-CPT', 'ACE']
	ExperienceYears int           `gorm:"default:0" json:"experienceYears"`
	
	// Stats
	Rating       float32 `gorm:"type:decimal(3,2);default:0.00" json:"rating"`
	TotalRatings int     `gorm:"default:0" json:"totalRatings"`
	TotalClients int     `gorm:"default:0" json:"totalClients"`
	
	// Availability
	Availability string          `gorm:"type:varchar(20);default:'available'" json:"availability"` // 'available', 'busy', 'unavailable'
	WorkingHours *string         `gorm:"type:jsonb" json:"workingHours"` // {"monday": "09:00-18:00"}
	
	// Social Media
	InstagramURL *string `gorm:"type:varchar(255)" json:"instagramUrl"`
	FacebookURL  *string `gorm:"type:varchar(255)" json:"facebookUrl"`
	YoutubeURL   *string `gorm:"type:varchar(255)" json:"youtubeUrl"`
	
	// Timestamps
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	User              User                `gorm:"foreignKey:UserID" json:"user"`
	Trainees          []Trainee           `gorm:"foreignKey:TrainerID" json:"-"`
	Programs          []Program           `gorm:"foreignKey:TrainerID" json:"-"`
	Schedules         []Schedule          `gorm:"foreignKey:TrainerID" json:"-"`
	SessionCards      []SessionCard       `gorm:"foreignKey:TrainerID" json:"-"`
	ExerciseLibraries []ExerciseLibrary   `gorm:"foreignKey:TrainerID" json:"-"`
}

// TableName specifies the table name
func (Trainer) TableName() string {
	return "trainers"
}
