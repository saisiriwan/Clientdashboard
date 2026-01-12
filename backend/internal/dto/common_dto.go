package dto

import "time"

// ==========================================
// COMMON DTOs - Shared between Trainee and Trainer
// ==========================================

// LocationResponse represents a location
type LocationResponse struct {
	ID       uint    `json:"id"`
	Name     string  `json:"name"`
	Address  *string `json:"address"`
	Floor    *string `json:"floor"`
	Building *string `json:"building"`
	
	// Contact
	PhoneNumber *string `json:"phoneNumber"`
	Email       *string `json:"email"`
	
	// Map
	Latitude  *float64 `json:"latitude"`
	Longitude *float64 `json:"longitude"`
	MapURL    *string  `json:"mapUrl"`
	
	// Operating Hours
	OpeningHours  *string  `json:"openingHours"`
	OperatingDays []string `json:"operatingDays"`
	
	// Facilities
	Facilities []string `json:"facilities"`
	Images     []string `json:"images"`
	
	IsActive bool `json:"isActive"`
}

// TrainerPublicResponse represents public trainer information
type TrainerPublicResponse struct {
	ID           uint    `json:"id"`
	Name         string  `json:"name"`
	ProfileImage *string `json:"profileImage"`
	
	// Professional Info
	Bio             *string  `json:"bio"`
	Specialization  []string `json:"specialization"`
	Certifications  []string `json:"certifications"`
	ExperienceYears int      `json:"experienceYears"`
	
	// Stats
	Rating       float32 `json:"rating"`
	TotalRatings int     `json:"totalRatings"`
	TotalClients int     `json:"totalClients"`
	
	// Availability
	Availability string `json:"availability"`
	
	// Social Media
	InstagramURL *string `json:"instagramUrl"`
	FacebookURL  *string `json:"facebookUrl"`
	YoutubeURL   *string `json:"youtubeUrl"`
}

// ExerciseCategoryResponse represents exercise categories
type ExerciseCategoryResponse struct {
	Category string `json:"category"`
	Count    int    `json:"count"`
}

// ExerciseLibraryResponse represents exercise from library
type ExerciseLibraryResponse struct {
	ID           uint     `json:"id"`
	Name         string   `json:"name"`
	Category     string   `json:"category"`
	Description  *string  `json:"description"`
	MuscleGroups []string `json:"muscleGroups"`
	Equipment    []string `json:"equipment"`
	Difficulty   *string  `json:"difficulty"`
	Instructions []string `json:"instructions"`
	VideoURL     *string  `json:"videoUrl"`
	ThumbnailURL *string  `json:"thumbnailUrl"`
	Images       []string `json:"images"`
	IsPublic     bool     `json:"isPublic"`
	UsageCount   int      `json:"usageCount"`
	
	// Creator info (if private exercise)
	Creator *struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	} `json:"creator,omitempty"`
	
	CreatedAt time.Time `json:"createdAt"`
}

// ErrorResponse represents error response
type ErrorResponse struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// SuccessResponse represents success response
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Message string      `json:"message,omitempty"`
}

// FilterParams represents common filter parameters
type FilterParams struct {
	Page     int    `form:"page" binding:"min=1"`
	PageSize int    `form:"pageSize" binding:"min=1,max=100"`
	SortBy   string `form:"sortBy"`
	Order    string `form:"order" binding:"omitempty,oneof=asc desc"`
	Search   string `form:"search"`
}

// DateRangeParams represents date range filter
type DateRangeParams struct {
	FromDate *time.Time `form:"fromDate"`
	ToDate   *time.Time `form:"toDate"`
}

// HealthCheckResponse represents health check response
type HealthCheckResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Version   string    `json:"version"`
	Database  string    `json:"database"`
}
