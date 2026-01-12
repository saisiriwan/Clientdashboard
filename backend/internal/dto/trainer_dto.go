package dto

import "time"

// ==========================================
// TRAINER DTOs - FULL CRUD
// Both Request (for CREATE/UPDATE) and Response DTOs
// ==========================================

// CreateClientRequest represents request to add a new client
type CreateClientRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Name     string `json:"name" binding:"required,min=2"`
	Password string `json:"password" binding:"required,min=8"`
	
	// Physical Info
	Height *float32 `json:"height" binding:"omitempty,min=0"`
	Weight *float32 `json:"weight" binding:"omitempty,min=0"`
	
	// Goals
	Goals        []string `json:"goals"`
	FitnessLevel *string  `json:"fitnessLevel" binding:"omitempty,oneof=beginner intermediate advanced"`
	
	// Medical
	MedicalNotes *string  `json:"medicalNotes"`
	Injuries     []string `json:"injuries"`
	Allergies    []string `json:"allergies"`
	
	// Contact
	PhoneNumber  *string    `json:"phoneNumber"`
	DateOfBirth  *time.Time `json:"dateOfBirth"`
	Gender       *string    `json:"gender" binding:"omitempty,oneof=male female other"`
	
	// Emergency Contact
	EmergencyContactName         *string `json:"emergencyContactName"`
	EmergencyContactPhone        *string `json:"emergencyContactPhone"`
	EmergencyContactRelationship *string `json:"emergencyContactRelationship"`
}

// UpdateClientRequest represents request to update client
type UpdateClientRequest struct {
	// Physical Info
	Height *float32 `json:"height" binding:"omitempty,min=0"`
	Weight *float32 `json:"weight" binding:"omitempty,min=0"`
	
	// Goals
	Goals        []string `json:"goals"`
	FitnessLevel *string  `json:"fitnessLevel" binding:"omitempty,oneof=beginner intermediate advanced"`
	
	// Medical
	MedicalNotes *string  `json:"medicalNotes"`
	Injuries     []string `json:"injuries"`
	Allergies    []string `json:"allergies"`
	
	// Contact
	PhoneNumber  *string    `json:"phoneNumber"`
	DateOfBirth  *time.Time `json:"dateOfBirth"`
	Gender       *string    `json:"gender" binding:"omitempty,oneof=male female other"`
	
	// Emergency Contact
	EmergencyContactName         *string `json:"emergencyContactName"`
	EmergencyContactPhone        *string `json:"emergencyContactPhone"`
	EmergencyContactRelationship *string `json:"emergencyContactRelationship"`
}

// CreateScheduleRequest represents request to create schedule
type CreateScheduleRequest struct {
	TraineeID           uint       `json:"traineeId" binding:"required"`
	LocationID          *uint      `json:"locationId"`
	ProgramAssignmentID *uint      `json:"programAssignmentId"`
	Date                time.Time  `json:"date" binding:"required"`
	Time                string     `json:"time" binding:"required"` // HH:MM format
	Duration            int        `json:"duration" binding:"required,min=1"`
	Title               string     `json:"title" binding:"required"`
	Description         *string    `json:"description"`
	SessionType         *string    `json:"sessionType"`
	PlannedExercises    []string   `json:"plannedExercises"`
}

// UpdateScheduleRequest represents request to update schedule
type UpdateScheduleRequest struct {
	LocationID       *uint      `json:"locationId"`
	Date             *time.Time `json:"date"`
	Time             *string    `json:"time"`
	Duration         *int       `json:"duration" binding:"omitempty,min=1"`
	Title            *string    `json:"title"`
	Description      *string    `json:"description"`
	SessionType      *string    `json:"sessionType"`
	PlannedExercises []string   `json:"plannedExercises"`
	Status           *string    `json:"status" binding:"omitempty,oneof=scheduled confirmed completed cancelled no_show"`
	Notes            *string    `json:"notes"`
}

// CreateSessionCardRequest represents request to create session card
type CreateSessionCardRequest struct {
	ScheduleID       uint     `json:"scheduleId" binding:"required"`
	Duration         int      `json:"duration" binding:"required,min=1"` // Actual duration
	OverallFeedback  *string  `json:"overallFeedback"`
	NextSessionGoals []string `json:"nextSessionGoals"`
	TraineeRating    *int     `json:"traineeRating" binding:"omitempty,min=1,max=5"`
	Exercises        []CreateSessionExerciseRequest `json:"exercises" binding:"required,min=1"`
}

// CreateSessionExerciseRequest represents exercise in session card
type CreateSessionExerciseRequest struct {
	ExerciseLibraryID *uint   `json:"exerciseLibraryId"`
	Name              string  `json:"name" binding:"required"`
	Category          *string `json:"category"`
	ExerciseOrder     int     `json:"exerciseOrder" binding:"required"`
	Notes             *string `json:"notes"`
	FormNotes         *string `json:"formNotes"`
	IsPR              bool    `json:"isPR"`
	PRNote            *string `json:"prNote"`
	Sets              []CreateExerciseSetRequest `json:"sets" binding:"required,min=1"`
}

// CreateExerciseSetRequest represents a set in an exercise
type CreateExerciseSetRequest struct {
	SetNumber    int      `json:"setNumber" binding:"required,min=1"`
	Reps         *int     `json:"reps" binding:"omitempty,min=0"`
	Weight       *float32 `json:"weight" binding:"omitempty,min=0"`
	Duration     *int     `json:"duration" binding:"omitempty,min=0"`
	Distance     *float32 `json:"distance" binding:"omitempty,min=0"`
	RestDuration *int     `json:"restDuration" binding:"omitempty,min=0"`
	Completed    bool     `json:"completed"`
	RPE          *int     `json:"rpe" binding:"omitempty,min=1,max=10"`
	Notes        *string  `json:"notes"`
}

// UpdateSessionCardRequest represents request to update session card
type UpdateSessionCardRequest struct {
	Duration         *int     `json:"duration" binding:"omitempty,min=1"`
	OverallFeedback  *string  `json:"overallFeedback"`
	NextSessionGoals []string `json:"nextSessionGoals"`
	TrainerRating    *int     `json:"trainerRating" binding:"omitempty,min=1,max=5"`
	TraineeRating    *int     `json:"traineeRating" binding:"omitempty,min=1,max=5"`
}

// CreateProgramRequest represents request to create program
type CreateProgramRequest struct {
	Name               string   `json:"name" binding:"required"`
	Description        *string  `json:"description"`
	TotalWeeks         int      `json:"totalWeeks" binding:"required,min=1"`
	SessionsPerWeek    int      `json:"sessionsPerWeek" binding:"required,min=1"`
	Goals              []string `json:"goals"`
	TargetFitnessLevel *string  `json:"targetFitnessLevel" binding:"omitempty,oneof=beginner intermediate advanced"`
	WeeklySchedule     *string  `json:"weeklySchedule"` // JSON string
}

// UpdateProgramRequest represents request to update program
type UpdateProgramRequest struct {
	Name               *string  `json:"name"`
	Description        *string  `json:"description"`
	TotalWeeks         *int     `json:"totalWeeks" binding:"omitempty,min=1"`
	SessionsPerWeek    *int     `json:"sessionsPerWeek" binding:"omitempty,min=1"`
	Goals              []string `json:"goals"`
	TargetFitnessLevel *string  `json:"targetFitnessLevel" binding:"omitempty,oneof=beginner intermediate advanced"`
	WeeklySchedule     *string  `json:"weeklySchedule"`
	Status             *string  `json:"status" binding:"omitempty,oneof=draft active archived"`
}

// AssignProgramRequest represents request to assign program to trainee
type AssignProgramRequest struct {
	TraineeID     uint      `json:"traineeId" binding:"required"`
	StartDate     time.Time `json:"startDate" binding:"required"`
	TotalSessions int       `json:"totalSessions" binding:"required,min=1"`
	Notes         *string   `json:"notes"`
}

// CreateExerciseRequest represents request to create exercise in library
type CreateExerciseRequest struct {
	Name         string   `json:"name" binding:"required"`
	Category     string   `json:"category" binding:"required"`
	Description  *string  `json:"description"`
	MuscleGroups []string `json:"muscleGroups"`
	Equipment    []string `json:"equipment"`
	Difficulty   *string  `json:"difficulty" binding:"omitempty,oneof=beginner intermediate advanced"`
	Instructions []string `json:"instructions"`
	VideoURL     *string  `json:"videoUrl"`
	ThumbnailURL *string  `json:"thumbnailUrl"`
	Images       []string `json:"images"`
	IsPublic     bool     `json:"isPublic"`
}

// UpdateExerciseRequest represents request to update exercise
type UpdateExerciseRequest struct {
	Name         *string  `json:"name"`
	Category     *string  `json:"category"`
	Description  *string  `json:"description"`
	MuscleGroups []string `json:"muscleGroups"`
	Equipment    []string `json:"equipment"`
	Difficulty   *string  `json:"difficulty" binding:"omitempty,oneof=beginner intermediate advanced"`
	Instructions []string `json:"instructions"`
	VideoURL     *string  `json:"videoUrl"`
	ThumbnailURL *string  `json:"thumbnailUrl"`
	Images       []string `json:"images"`
	IsPublic     *bool    `json:"isPublic"`
}

// ClientDetailResponse represents detailed client information
type ClientDetailResponse struct {
	User    UserInfo    `json:"user"`
	Trainee TraineeInfo `json:"trainee"`
	
	// Current Program
	CurrentProgram *ProgramAssignmentResponse `json:"currentProgram,omitempty"`
	
	// Recent Sessions
	RecentSessions []SessionCardResponse `json:"recentSessions"`
	
	// Latest Metrics
	LatestMetrics []MetricResponse `json:"latestMetrics"`
	
	// Upcoming Schedules
	UpcomingSchedules []ScheduleResponse `json:"upcomingSchedules"`
}

// DashboardStatsResponse represents trainer dashboard stats
type DashboardStatsResponse struct {
	TotalClients      int     `json:"totalClients"`
	ActiveClients     int     `json:"activeClients"`
	TotalSessions     int     `json:"totalSessions"`
	CompletedSessions int     `json:"completedSessions"`
	UpcomingSessions  int     `json:"upcomingSessions"`
	AverageRating     float32 `json:"averageRating"`
	
	// Today
	TodaySessions []ScheduleResponse `json:"todaySessions"`
	
	// This Week
	WeekSessions []ScheduleResponse `json:"weekSessions"`
	
	// Recent Clients
	RecentClients []struct {
		ID           uint    `json:"id"`
		Name         string  `json:"name"`
		ProfileImage *string `json:"profileImage"`
		LastSession  *time.Time `json:"lastSession"`
	} `json:"recentClients"`
}

// AnalyticsOverviewResponse represents analytics overview
type AnalyticsOverviewResponse struct {
	TotalRevenue      float32 `json:"totalRevenue"`
	AverageSessionRate float32 `json:"averageSessionRate"`
	ClientRetentionRate float32 `json:"clientRetentionRate"`
	
	// Charts data
	SessionsPerWeek    []int   `json:"sessionsPerWeek"`
	ClientGrowth       []int   `json:"clientGrowth"`
	PopularExercises   []string `json:"popularExercises"`
}

// ClientAnalyticsResponse represents client-specific analytics
type ClientAnalyticsResponse struct {
	TraineeID uint   `json:"traineeId"`
	Name      string `json:"name"`
	
	// Progress
	TotalSessions     int     `json:"totalSessions"`
	AttendanceRate    float32 `json:"attendanceRate"`
	AverageSessionDuration int `json:"averageSessionDuration"`
	
	// Metrics Progress
	WeightProgress []struct {
		Date  time.Time `json:"date"`
		Value float32   `json:"value"`
	} `json:"weightProgress"`
	
	BodyFatProgress []struct {
		Date  time.Time `json:"date"`
		Value float32   `json:"value"`
	} `json:"bodyFatProgress"`
	
	// Exercise Performance
	TopExercises []struct {
		Name       string  `json:"name"`
		MaxWeight  float32 `json:"maxWeight"`
		TotalVolume float32 `json:"totalVolume"`
	} `json:"topExercises"`
}
