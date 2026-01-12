package dto

import "time"

// ==========================================
// TRAINEE DTOs - READ-ONLY
// All responses, NO request DTOs for CREATE/UPDATE
// ==========================================

// ScheduleResponse represents a schedule (READ-ONLY for trainee)
type ScheduleResponse struct {
	ID          uint       `json:"id"`
	Date        time.Time  `json:"date"`
	Time        string     `json:"time"`
	Duration    int        `json:"duration"` // minutes
	Title       string     `json:"title"`
	Description *string    `json:"description"`
	Status      string     `json:"status"`
	SessionType *string    `json:"sessionType"`
	
	// Trainer info
	Trainer struct {
		ID           uint    `json:"id"`
		Name         string  `json:"name"`
		ProfileImage *string `json:"profileImage"`
	} `json:"trainer"`
	
	// Location info
	Location *struct {
		ID      uint    `json:"id"`
		Name    string  `json:"name"`
		Address *string `json:"address"`
		Floor   *string `json:"floor"`
	} `json:"location,omitempty"`
	
	// Related program
	ProgramName *string `json:"programName,omitempty"`
	
	Notes *string `json:"notes"`
	
	CreatedAt time.Time `json:"createdAt"`
}

// ProgramResponse represents a program (READ-ONLY for trainee)
type ProgramResponse struct {
	ID          uint    `json:"id"`
	Name        string  `json:"name"`
	Description *string `json:"description"`
	
	// Duration
	TotalWeeks      int `json:"totalWeeks"`
	SessionsPerWeek int `json:"sessionsPerWeek"`
	
	// Goals
	Goals              []string `json:"goals"`
	TargetFitnessLevel *string  `json:"targetFitnessLevel"`
	
	// Trainer
	Trainer struct {
		ID           uint    `json:"id"`
		Name         string  `json:"name"`
		ProfileImage *string `json:"profileImage"`
	} `json:"trainer"`
	
	// Assignment info (if assigned to trainee)
	Assignment *ProgramAssignmentResponse `json:"assignment,omitempty"`
	
	CreatedAt time.Time `json:"createdAt"`
}

// ProgramAssignmentResponse represents a program assignment (READ-ONLY)
type ProgramAssignmentResponse struct {
	ID                 uint      `json:"id"`
	StartDate          time.Time `json:"startDate"`
	EndDate            time.Time `json:"endDate"`
	CurrentWeek        int       `json:"currentWeek"`
	ProgressPercentage float32   `json:"progressPercentage"`
	SessionsCompleted  int       `json:"sessionsCompleted"`
	TotalSessions      int       `json:"totalSessions"`
	Status             string    `json:"status"`
	Notes              *string   `json:"notes"`
}

// SessionCardResponse represents a session card (READ-ONLY)
type SessionCardResponse struct {
	ID               uint      `json:"id"`
	Date             time.Time `json:"date"`
	Title            string    `json:"title"`
	Duration         int       `json:"duration"` // minutes
	OverallFeedback  *string   `json:"overallFeedback"`
	NextSessionGoals []string  `json:"nextSessionGoals"`
	
	// Trainer
	Trainer struct {
		ID           uint    `json:"id"`
		Name         string  `json:"name"`
		ProfileImage *string `json:"profileImage"`
	} `json:"trainer"`
	
	// Stats
	TotalExercises int     `json:"totalExercises"`
	TotalSets      int     `json:"totalSets"`
	TotalVolume    float32 `json:"totalVolume"` // kg
	
	// Rating
	TrainerRating *int `json:"trainerRating"`
	TraineeRating *int `json:"traineeRating"`
	
	// Exercises
	Exercises []SessionExerciseResponse `json:"exercises"`
	
	CreatedAt time.Time `json:"createdAt"`
}

// SessionExerciseResponse represents an exercise in a session (READ-ONLY)
type SessionExerciseResponse struct {
	ID            uint    `json:"id"`
	Name          string  `json:"name"`
	Category      *string `json:"category"`
	ExerciseOrder int     `json:"exerciseOrder"`
	Notes         *string `json:"notes"`
	FormNotes     *string `json:"formNotes"`
	
	// Stats
	TotalSets   int     `json:"totalSets"`
	TotalReps   int     `json:"totalReps"`
	TotalWeight float32 `json:"totalWeight"`
	TotalVolume float32 `json:"totalVolume"`
	
	// Personal Record
	IsPR   bool    `json:"isPR"`
	PRNote *string `json:"prNote"`
	
	// Sets
	Sets []ExerciseSetResponse `json:"sets"`
}

// ExerciseSetResponse represents a set in an exercise (READ-ONLY)
type ExerciseSetResponse struct {
	ID        uint `json:"id"`
	SetNumber int  `json:"setNumber"`
	
	// Weight Training
	Reps   *int     `json:"reps"`
	Weight *float32 `json:"weight"` // kg
	
	// Cardio
	Duration *int     `json:"duration"` // seconds
	Distance *float32 `json:"distance"` // km
	
	// Rest
	RestDuration *int `json:"restDuration"` // seconds
	
	// Status
	Completed bool `json:"completed"`
	RPE       *int `json:"rpe"` // Rate of Perceived Exertion (1-10)
	
	Notes *string `json:"notes"`
}

// MetricResponse represents a metric (READ-ONLY)
type MetricResponse struct {
	ID              uint      `json:"id"`
	Date            time.Time `json:"date"`
	Type            string    `json:"type"` // 'weight', 'body_fat', 'muscle_mass', 'measurement'
	Value           float32   `json:"value"`
	Unit            string    `json:"unit"`
	MeasurementType *string   `json:"measurementType"` // For type='measurement'
	Notes           *string   `json:"notes"`
	RecordedBy      *string   `json:"recordedBy"` // Name of who recorded it
	CreatedAt       time.Time `json:"createdAt"`
}

// NotificationResponse represents a notification (READ-ONLY)
type NotificationResponse struct {
	ID          uint      `json:"id"`
	Type        string    `json:"type"`
	Title       string    `json:"title"`
	Message     string    `json:"message"`
	RelatedID   *uint     `json:"relatedId"`
	RelatedType *string   `json:"relatedType"`
	ActionURL   *string   `json:"actionUrl"`
	Priority    string    `json:"priority"`
	IsRead      bool      `json:"isRead"`
	ReadAt      *time.Time `json:"readAt"`
	CreatedAt   time.Time `json:"createdAt"`
}

// StatsResponse represents trainee stats (READ-ONLY)
type StatsResponse struct {
	TotalSessions      int       `json:"totalSessions"`
	CompletedSessions  int       `json:"completedSessions"`
	CancelledSessions  int       `json:"cancelledSessions"`
	CurrentStreak      int       `json:"currentStreak"`
	LongestStreak      int       `json:"longestStreak"`
	TotalWorkoutHours  float32   `json:"totalWorkoutHours"`
	UpcomingSessions   int       `json:"upcomingSessions"`
	LastSessionDate    *time.Time `json:"lastSessionDate"`
	
	// Current Program
	CurrentProgram *struct {
		ID                 uint    `json:"id"`
		Name               string  `json:"name"`
		ProgressPercentage float32 `json:"progressPercentage"`
		CurrentWeek        int     `json:"currentWeek"`
		TotalWeeks         int     `json:"totalWeeks"`
	} `json:"currentProgram,omitempty"`
	
	// Recent Achievements
	RecentAchievements []AchievementResponse `json:"recentAchievements"`
}

// AchievementResponse represents an achievement (READ-ONLY)
type AchievementResponse struct {
	ID          uint      `json:"id"`
	Type        string    `json:"type"`
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	BadgeIcon   *string   `json:"badgeIcon"`
	BadgeColor  *string   `json:"badgeColor"`
	Value       *int      `json:"value"`
	AchievedAt  time.Time `json:"achievedAt"`
}

// ProfileResponse represents trainee profile (READ-ONLY)
type ProfileResponse struct {
	User    UserInfo     `json:"user"`
	Trainee TraineeInfo  `json:"trainee"`
	Stats   StatsResponse `json:"stats"`
}

// SearchSessionsRequest for filtering sessions (GET params)
type SearchSessionsRequest struct {
	FromDate   *time.Time `form:"fromDate"`
	ToDate     *time.Time `form:"toDate"`
	Category   *string    `form:"category"`
	ExerciseName *string  `form:"exerciseName"`
	Page       int        `form:"page" binding:"min=1"`
	PageSize   int        `form:"pageSize" binding:"min=1,max=100"`
}

// PaginatedResponse represents paginated response
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Page       int         `json:"page"`
	PageSize   int         `json:"pageSize"`
	TotalItems int64       `json:"totalItems"`
	TotalPages int         `json:"totalPages"`
}
