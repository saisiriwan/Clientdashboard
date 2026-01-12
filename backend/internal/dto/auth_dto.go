package dto

import "time"

// RegisterRequest represents registration request
type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=255"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"required,oneof=trainer trainee"`
	
	// Optional fields
	PhoneNumber *string    `json:"phoneNumber" binding:"omitempty,min=10,max=20"`
	DateOfBirth *time.Time `json:"dateOfBirth"`
	Gender      *string    `json:"gender" binding:"omitempty,oneof=male female other"`
}

// LoginRequest represents login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse represents login response
type LoginResponse struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	User         *UserInfo `json:"user"`
}

// UserInfo represents user information in response
type UserInfo struct {
	ID           uint       `json:"id"`
	Email        string     `json:"email"`
	Name         string     `json:"name"`
	Role         string     `json:"role"`
	ProfileImage *string    `json:"profileImage"`
	PhoneNumber  *string    `json:"phoneNumber"`
	DateOfBirth  *time.Time `json:"dateOfBirth"`
	Gender       *string    `json:"gender"`
	
	// OAuth info
	OAuthProvider *string `json:"oauthProvider"`
	
	// Security
	EmailVerified bool       `json:"emailVerified"`
	LastLoginAt   *time.Time `json:"lastLoginAt"`
	
	// Role-specific data
	Trainer *TrainerInfo `json:"trainer,omitempty"`
	Trainee *TraineeInfo `json:"trainee,omitempty"`
	
	CreatedAt time.Time `json:"createdAt"`
}

// TrainerInfo represents trainer-specific information
type TrainerInfo struct {
	ID              uint     `json:"id"`
	Bio             *string  `json:"bio"`
	Specialization  []string `json:"specialization"`
	Certifications  []string `json:"certifications"`
	ExperienceYears int      `json:"experienceYears"`
	Rating          float32  `json:"rating"`
	TotalClients    int      `json:"totalClients"`
	Availability    string   `json:"availability"`
}

// TraineeInfo represents trainee-specific information
type TraineeInfo struct {
	ID               uint     `json:"id"`
	Height           float32  `json:"height"`
	Weight           float32  `json:"weight"`
	Goals            []string `json:"goals"`
	FitnessLevel     *string  `json:"fitnessLevel"`
	TotalSessions    int      `json:"totalSessions"`
	CompletedSessions int     `json:"completedSessions"`
	CurrentStreak    int      `json:"currentStreak"`
	TrainerName      *string  `json:"trainerName,omitempty"`
}

// RefreshTokenRequest represents refresh token request
type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

// GoogleCallbackResponse represents Google OAuth callback response
type GoogleCallbackResponse struct {
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	User         *UserInfo `json:"user"`
	IsNewUser    bool      `json:"isNewUser"`
}
