package models

import (
	"time"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

// Location represents a training location/branch
type Location struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"not null" json:"name"`
	Address  *string `gorm:"type:text" json:"address"`
	Floor    *string `gorm:"type:varchar(10)" json:"floor"`
	Building *string `gorm:"type:varchar(255)" json:"building"`
	
	// Contact
	PhoneNumber *string `gorm:"type:varchar(20)" json:"phoneNumber"`
	Email       *string `gorm:"type:varchar(255)" json:"email"`
	
	// Map
	Latitude  *float64 `gorm:"type:decimal(10,8)" json:"latitude"`
	Longitude *float64 `gorm:"type:decimal(11,8)" json:"longitude"`
	MapURL    *string  `gorm:"type:text" json:"mapUrl"`
	
	// Operating Hours
	OpeningHours   *string        `gorm:"type:varchar(50)" json:"openingHours"` // "06:00-22:00"
	OperatingDays  pq.StringArray `gorm:"type:text[]" json:"operatingDays"` // ['monday', 'tuesday']
	
	// Facilities
	Facilities pq.StringArray `gorm:"type:text[]" json:"facilities"` // ['Cardio Zone', 'Free Weights']
	Images     pq.StringArray `gorm:"type:text[]" json:"images"` // Array of image URLs
	
	// Status
	IsActive bool `gorm:"default:true" json:"isActive"`
	
	// Timestamps
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Location) TableName() string {
	return "locations"
}

// Program represents a training program template
type Program struct {
	ID        uint `gorm:"primaryKey" json:"id"`
	TrainerID uint `gorm:"not null;index" json:"trainerId"`
	
	// Program Info
	Name        string  `gorm:"not null" json:"name"`
	Description *string `gorm:"type:text" json:"description"`
	
	// Duration
	TotalWeeks      int `gorm:"not null" json:"totalWeeks"`
	SessionsPerWeek int `gorm:"not null" json:"sessionsPerWeek"`
	
	// Goals
	Goals             pq.StringArray `gorm:"type:text[]" json:"goals"`
	TargetFitnessLevel *string       `gorm:"type:varchar(20)" json:"targetFitnessLevel"` // 'beginner', 'intermediate', 'advanced'
	
	// Schedule
	WeeklySchedule *string `gorm:"type:jsonb" json:"weeklySchedule"` // JSON array
	
	// Status
	Status string `gorm:"type:varchar(20);default:'draft'" json:"status"` // 'draft', 'active', 'archived'
	
	// Stats
	TotalAssignments int     `gorm:"default:0" json:"totalAssignments"`
	CompletionRate   float32 `gorm:"type:decimal(5,2);default:0.00" json:"completionRate"`
	
	// Timestamps
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	Trainer     Trainer             `gorm:"foreignKey:TrainerID" json:"trainer"`
	Assignments []ProgramAssignment `gorm:"foreignKey:ProgramID" json:"-"`
}

func (Program) TableName() string {
	return "programs"
}

// ProgramAssignment represents a program assigned to a trainee
type ProgramAssignment struct {
	ID        uint `gorm:"primaryKey" json:"id"`
	ProgramID uint `gorm:"not null;index" json:"programId"`
	TraineeID uint `gorm:"not null;index" json:"traineeId"`
	
	// Timeline
	StartDate   time.Time `gorm:"not null" json:"startDate"`
	EndDate     time.Time `gorm:"not null" json:"endDate"`
	CurrentWeek int       `gorm:"default:1" json:"currentWeek"`
	
	// Progress
	ProgressPercentage float32 `gorm:"type:decimal(5,2);default:0.00" json:"progressPercentage"`
	SessionsCompleted  int     `gorm:"default:0" json:"sessionsCompleted"`
	TotalSessions      int     `gorm:"not null" json:"totalSessions"`
	
	// Status
	Status string `gorm:"type:varchar(20);default:'active'" json:"status"` // 'active', 'completed', 'paused', 'cancelled'
	
	// Notes
	Notes         *string `gorm:"type:text" json:"notes"`
	ProgressNotes *string `gorm:"type:jsonb" json:"progressNotes"` // JSON array
	
	// Timestamps
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	Program   Program   `gorm:"foreignKey:ProgramID" json:"program"`
	Trainee   Trainee   `gorm:"foreignKey:TraineeID" json:"trainee"`
	Schedules []Schedule `gorm:"foreignKey:ProgramAssignmentID" json:"-"`
}

func (ProgramAssignment) TableName() string {
	return "program_assignments"
}

// SessionCard represents a session summary card
type SessionCard struct {
	ID         uint `gorm:"primaryKey" json:"id"`
	ScheduleID uint `gorm:"uniqueIndex;not null" json:"scheduleId"`
	TrainerID  uint `gorm:"not null;index" json:"trainerId"`
	TraineeID  uint `gorm:"not null;index" json:"traineeId"`
	
	// Session Info
	Date     time.Time `gorm:"not null;index" json:"date"`
	Title    string    `gorm:"not null" json:"title"`
	Duration int       `gorm:"not null" json:"duration"` // minutes
	
	// Feedback
	OverallFeedback  *string        `gorm:"type:text" json:"overallFeedback"`
	NextSessionGoals pq.StringArray `gorm:"type:text[]" json:"nextSessionGoals"`
	
	// Rating
	TrainerRating *int `json:"trainerRating"` // 1-5
	TraineeRating *int `json:"traineeRating"` // 1-5
	
	// Stats
	TotalExercises int     `gorm:"default:0" json:"totalExercises"`
	TotalSets      int     `gorm:"default:0" json:"totalSets"`
	TotalVolume    float32 `gorm:"type:decimal(10,2);default:0.00" json:"totalVolume"` // kg
	
	// Timestamps
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	Schedule  Schedule          `gorm:"foreignKey:ScheduleID" json:"schedule"`
	Trainer   Trainer           `gorm:"foreignKey:TrainerID" json:"trainer"`
	Trainee   Trainee           `gorm:"foreignKey:TraineeID" json:"trainee"`
	Exercises []SessionExercise `gorm:"foreignKey:SessionCardID" json:"exercises"`
}

func (SessionCard) TableName() string {
	return "session_cards"
}

// SessionExercise represents an exercise in a session
type SessionExercise struct {
	ID            uint  `gorm:"primaryKey" json:"id"`
	SessionCardID uint  `gorm:"not null;index" json:"sessionCardId"`
	ExerciseLibraryID *uint `json:"exerciseLibraryId"`
	
	// Exercise Info
	Name     string  `gorm:"not null" json:"name"`
	Category *string `gorm:"type:varchar(50)" json:"category"`
	
	// Order
	ExerciseOrder int `gorm:"not null" json:"exerciseOrder"`
	
	// Notes
	Notes     *string `gorm:"type:text" json:"notes"`
	FormNotes *string `gorm:"type:text" json:"formNotes"`
	
	// Stats (Calculated from sets)
	TotalSets   int     `gorm:"default:0" json:"totalSets"`
	TotalReps   int     `gorm:"default:0" json:"totalReps"`
	TotalWeight float32 `gorm:"type:decimal(10,2);default:0.00" json:"totalWeight"`
	TotalVolume float32 `gorm:"type:decimal(10,2);default:0.00" json:"totalVolume"`
	
	// Personal Records
	IsPR   bool    `gorm:"default:false" json:"isPR"`
	PRNote *string `gorm:"type:text" json:"prNote"`
	
	// Timestamps
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	
	// Relationships
	SessionCard     SessionCard      `gorm:"foreignKey:SessionCardID" json:"-"`
	ExerciseLibrary *ExerciseLibrary `gorm:"foreignKey:ExerciseLibraryID" json:"-"`
	Sets            []ExerciseSet    `gorm:"foreignKey:SessionExerciseID" json:"sets"`
}

func (SessionExercise) TableName() string {
	return "session_exercises"
}

// ExerciseSet represents a set in an exercise
type ExerciseSet struct {
	ID                 uint `gorm:"primaryKey" json:"id"`
	SessionExerciseID  uint `gorm:"not null;index" json:"sessionExerciseId"`
	
	// Set Info
	SetNumber int `gorm:"not null" json:"setNumber"`
	
	// Weight Training
	Reps   *int     `json:"reps"`
	Weight *float32 `gorm:"type:decimal(6,2)" json:"weight"` // kg
	
	// Cardio/Endurance
	Duration *int     `json:"duration"` // seconds
	Distance *float32 `gorm:"type:decimal(6,2)" json:"distance"` // km
	
	// Rest
	RestDuration *int `json:"restDuration"` // seconds
	
	// Completion
	Completed bool `gorm:"default:true" json:"completed"`
	
	// RPE (Rate of Perceived Exertion)
	RPE *int `json:"rpe"` // 1-10
	
	// Notes
	Notes *string `gorm:"type:text" json:"notes"`
	
	// Timestamps
	CreatedAt time.Time `json:"createdAt"`
	
	// Relationships
	SessionExercise SessionExercise `gorm:"foreignKey:SessionExerciseID" json:"-"`
}

func (ExerciseSet) TableName() string {
	return "exercise_sets"
}

// ExerciseLibrary represents an exercise in the library
type ExerciseLibrary struct {
	ID        uint  `gorm:"primaryKey" json:"id"`
	TrainerID *uint `json:"trainerId"` // NULL = public exercises
	
	// Exercise Info
	Name        string  `gorm:"not null" json:"name"`
	Category    string  `gorm:"not null" json:"category"`
	Description *string `gorm:"type:text" json:"description"`
	
	// Muscle Groups
	MuscleGroups pq.StringArray `gorm:"type:text[]" json:"muscleGroups"`
	
	// Equipment
	Equipment pq.StringArray `gorm:"type:text[]" json:"equipment"`
	
	// Difficulty
	Difficulty *string `gorm:"type:varchar(20)" json:"difficulty"` // 'beginner', 'intermediate', 'advanced'
	
	// Instructions
	Instructions pq.StringArray `gorm:"type:text[]" json:"instructions"`
	
	// Media
	VideoURL     *string        `gorm:"type:text" json:"videoUrl"`
	ThumbnailURL *string        `gorm:"type:text" json:"thumbnailUrl"`
	Images       pq.StringArray `gorm:"type:text[]" json:"images"`
	
	// Status
	IsPublic   bool `gorm:"default:false" json:"isPublic"`
	IsVerified bool `gorm:"default:false" json:"isVerified"`
	
	// Stats
	UsageCount int `gorm:"default:0" json:"usageCount"`
	
	// Timestamps
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	Trainer *Trainer `gorm:"foreignKey:TrainerID" json:"-"`
}

func (ExerciseLibrary) TableName() string {
	return "exercise_library"
}

// Metric represents a body measurement
type Metric struct {
	ID        uint `gorm:"primaryKey" json:"id"`
	TraineeID uint `gorm:"not null;index" json:"traineeId"`
	
	// Measurement
	Date  time.Time `gorm:"not null;index" json:"date"`
	Type  string    `gorm:"not null;index" json:"type"` // 'weight', 'body_fat', 'muscle_mass', 'measurement'
	Value float32   `gorm:"type:decimal(8,2);not null" json:"value"`
	Unit  string    `gorm:"not null" json:"unit"` // 'kg', '%', 'cm'
	
	// Body Measurements (for type = 'measurement')
	MeasurementType *string `gorm:"type:varchar(50)" json:"measurementType"` // 'chest', 'waist', 'arms'
	
	// Notes
	Notes *string `gorm:"type:text" json:"notes"`
	
	// Recorded By
	RecordedBy *uint `json:"recordedBy"` // user_id
	
	// Timestamps
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	Trainee Trainee `gorm:"foreignKey:TraineeID" json:"-"`
}

func (Metric) TableName() string {
	return "metrics"
}

// Notification represents a notification
type Notification struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	UserID uint `gorm:"not null;index" json:"userId"`
	
	// Notification Info
	Type    string `gorm:"not null;index" json:"type"` // 'schedule', 'progress', 'achievement', 'system', 'message'
	Title   string `gorm:"not null" json:"title"`
	Message string `gorm:"type:text;not null" json:"message"`
	
	// Related Entity
	RelatedID   *uint   `json:"relatedId"`
	RelatedType *string `gorm:"type:varchar(50)" json:"relatedType"`
	
	// Action
	ActionURL *string `gorm:"type:text" json:"actionUrl"`
	
	// Priority
	Priority string `gorm:"type:varchar(20);default:'medium'" json:"priority"` // 'low', 'medium', 'high'
	
	// Status
	IsRead bool       `gorm:"default:false;index" json:"isRead"`
	ReadAt *time.Time `json:"readAt"`
	
	// Delivery
	SentVia pq.StringArray `gorm:"type:text[]" json:"sentVia"` // ['in_app', 'email', 'push']
	
	// Timestamps
	CreatedAt time.Time      `json:"createdAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Relationships
	User User `gorm:"foreignKey:UserID" json:"-"`
}

func (Notification) TableName() string {
	return "notifications"
}

// Achievement represents an achievement/badge
type Achievement struct {
	ID        uint `gorm:"primaryKey" json:"id"`
	TraineeID uint `gorm:"not null;index" json:"traineeId"`
	
	// Achievement Info
	Type        string  `gorm:"not null" json:"type"` // 'streak', 'milestone', 'pr', 'completion'
	Title       string  `gorm:"not null" json:"title"`
	Description *string `gorm:"type:text" json:"description"`
	
	// Badge
	BadgeIcon  *string `gorm:"type:text" json:"badgeIcon"` // Emoji or URL
	BadgeColor *string `gorm:"type:varchar(7)" json:"badgeColor"` // Hex color
	
	// Stats
	Value *int `json:"value"` // e.g., 5 for "5 day streak"
	
	// Date
	AchievedAt time.Time `gorm:"not null;index" json:"achievedAt"`
	
	// Timestamps
	CreatedAt time.Time `json:"createdAt"`
	
	// Relationships
	Trainee Trainee `gorm:"foreignKey:TraineeID" json:"-"`
}

func (Achievement) TableName() string {
	return "achievements"
}

// RefreshToken represents a JWT refresh token
type RefreshToken struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	UserID uint `gorm:"not null;index" json:"userId"`
	
	// Token
	Token string `gorm:"uniqueIndex;not null" json:"-"`
	
	// Expiry
	ExpiresAt time.Time `gorm:"not null;index" json:"expiresAt"`
	
	// Device Info
	DeviceType *string `gorm:"type:varchar(50)" json:"deviceType"` // 'web', 'ios', 'android'
	DeviceName *string `gorm:"type:varchar(255)" json:"deviceName"`
	IPAddress  *string `gorm:"type:inet" json:"ipAddress"`
	UserAgent  *string `gorm:"type:text" json:"userAgent"`
	
	// Status
	IsRevoked bool       `gorm:"default:false" json:"isRevoked"`
	RevokedAt *time.Time `json:"revokedAt"`
	
	// Timestamps
	CreatedAt time.Time `json:"createdAt"`
	
	// Relationships
	User User `gorm:"foreignKey:UserID" json:"-"`
}

func (RefreshToken) TableName() string {
	return "refresh_tokens"
}
