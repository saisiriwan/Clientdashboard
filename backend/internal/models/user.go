package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system (Authentication)
type User struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Email string `gorm:"uniqueIndex;not null" json:"email"`
	
	// Password (nullable for OAuth users)
	PasswordHash *string `gorm:"type:varchar(255)" json:"-"`
	
	// Profile
	Name         string  `gorm:"not null" json:"name"`
	Role         string  `gorm:"type:varchar(20);not null;check:role IN ('trainer','trainee','admin')" json:"role"`
	ProfileImage *string `gorm:"type:text" json:"profileImage"`
	PhoneNumber  *string `gorm:"type:varchar(20)" json:"phoneNumber"`
	DateOfBirth  *time.Time `json:"dateOfBirth"`
	Gender       *string `gorm:"type:varchar(10);check:gender IN ('male','female','other')" json:"gender"`
	
	// OAuth fields
	OAuthProvider      *string    `gorm:"type:varchar(50)" json:"oauthProvider"` // 'google', 'facebook', null
	OAuthID            *string    `gorm:"type:varchar(255)" json:"-"`
	OAuthAccessToken   *string    `gorm:"type:text" json:"-"`
	OAuthRefreshToken  *string    `gorm:"type:text" json:"-"`
	OAuthTokenExpiry   *time.Time `json:"-"`
	
	// Security
	EmailVerified   bool       `gorm:"default:false" json:"emailVerified"`
	EmailVerifiedAt *time.Time `json:"emailVerifiedAt"`
	IsActive        bool       `gorm:"default:true" json:"isActive"`
	LastLoginAt     *time.Time `json:"lastLoginAt"`
	
	// Timestamps
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	Trainer       *Trainer       `gorm:"foreignKey:UserID" json:"trainer,omitempty"`
	Trainee       *Trainee       `gorm:"foreignKey:UserID" json:"trainee,omitempty"`
	Notifications []Notification `gorm:"foreignKey:UserID" json:"-"`
	RefreshTokens []RefreshToken `gorm:"foreignKey:UserID" json:"-"`
}

// TableName specifies the table name
func (User) TableName() string {
	return "users"
}

// BeforeCreate hook
func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.CreatedAt = time.Now().UTC()
	u.UpdatedAt = time.Now().UTC()
	return nil
}

// BeforeUpdate hook
func (u *User) BeforeUpdate(tx *gorm.DB) error {
	u.UpdatedAt = time.Now().UTC()
	return nil
}

// IsTrainer checks if user is a trainer
func (u *User) IsTrainer() bool {
	return u.Role == "trainer"
}

// IsTrainee checks if user is a trainee
func (u *User) IsTrainee() bool {
	return u.Role == "trainee"
}

// IsAdmin checks if user is an admin
func (u *User) IsAdmin() bool {
	return u.Role == "admin"
}
