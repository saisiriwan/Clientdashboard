package routes

import (
	"fitness-training-backend/internal/config"
	"fitness-training-backend/internal/database"
	"fitness-training-backend/internal/handler"
	"fitness-training-backend/internal/middleware"
	"fitness-training-backend/internal/repository"
	"fitness-training-backend/internal/service"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(router *gin.Engine, cfg *config.Config) {
	// Initialize repositories
	userRepo := repository.NewUserRepository(database.DB)
	trainerRepo := repository.NewTrainerRepository(database.DB)
	traineeRepo := repository.NewTraineeRepository(database.DB)
	scheduleRepo := repository.NewScheduleRepository(database.DB)
	programRepo := repository.NewProgramRepository(database.DB)
	sessionCardRepo := repository.NewSessionCardRepository(database.DB)
	notificationRepo := repository.NewNotificationRepository(database.DB)
	metricRepo := repository.NewMetricRepository(database.DB)
	locationRepo := repository.NewLocationRepository(database.DB)
	
	// Initialize services
	authService := service.NewAuthService(userRepo, cfg)
	traineeService := service.NewTraineeService(traineeRepo, scheduleRepo, programRepo, sessionCardRepo, notificationRepo, metricRepo)
	trainerService := service.NewTrainerService(trainerRepo, traineeRepo, scheduleRepo, programRepo, sessionCardRepo)
	
	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService, cfg)
	traineeHandler := handler.NewTraineeHandler(traineeService)
	trainerHandler := handler.NewTrainerHandler(trainerService)
	locationHandler := handler.NewLocationHandler(locationRepo)
	
	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// ==========================================
		// Authentication Routes (Public)
		// ==========================================
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", authHandler.Logout)
			auth.GET("/me", middleware.AuthMiddleware(cfg), authHandler.Me)
			auth.GET("/google/login", authHandler.GoogleLogin)
			auth.GET("/google/callback", authHandler.GoogleCallback)
			auth.POST("/refresh", authHandler.RefreshToken)
		}
		
		// ==========================================
		// Trainee Routes (Read-Only)
		// ==========================================
		trainee := v1.Group("/trainee")
		trainee.Use(middleware.AuthMiddleware(cfg))
		trainee.Use(middleware.TraineeOnly())
		{
			// Schedules
			trainee.GET("/schedules/upcoming", traineeHandler.GetUpcomingSchedules)
			trainee.GET("/schedules", traineeHandler.GetSchedules)
			trainee.GET("/schedules/:id", traineeHandler.GetScheduleDetail)
			
			// Programs
			trainee.GET("/programs/current", traineeHandler.GetCurrentProgram)
			trainee.GET("/programs", traineeHandler.GetPrograms)
			trainee.GET("/programs/:id", traineeHandler.GetProgramDetail)
			
			// Stats
			trainee.GET("/stats", traineeHandler.GetStats)
			
			// Notifications
			trainee.GET("/notifications", traineeHandler.GetNotifications)
			trainee.PUT("/notifications/:id/read", traineeHandler.MarkNotificationAsRead)
			trainee.PUT("/notifications/read-all", traineeHandler.MarkAllNotificationsAsRead)
			
			// Session Cards
			trainee.GET("/sessions", traineeHandler.GetSessions)
			trainee.GET("/sessions/:id", traineeHandler.GetSessionDetail)
			trainee.GET("/sessions/search", traineeHandler.SearchSessions)
			
			// Metrics
			trainee.GET("/metrics", traineeHandler.GetMetrics)
			
			// Profile
			trainee.GET("/me", traineeHandler.GetProfile)
		}
		
		// ==========================================
		// Trainer Routes (Full CRUD)
		// ==========================================
		trainer := v1.Group("/trainer")
		trainer.Use(middleware.AuthMiddleware(cfg))
		trainer.Use(middleware.TrainerOnly())
		{
			// Dashboard
			trainer.GET("/dashboard/stats", trainerHandler.GetDashboardStats)
			
			// Clients Management
			trainer.GET("/clients", trainerHandler.GetClients)
			trainer.GET("/clients/:id", trainerHandler.GetClientDetail)
			trainer.POST("/clients", trainerHandler.AddClient)
			trainer.PATCH("/clients/:id", trainerHandler.UpdateClient)
			trainer.DELETE("/clients/:id", trainerHandler.RemoveClient)
			trainer.GET("/clients/:id/metrics", trainerHandler.GetClientMetrics)
			trainer.GET("/clients/:id/sessions", trainerHandler.GetClientSessions)
			
			// Schedules Management
			trainer.GET("/schedules", trainerHandler.GetSchedules)
			trainer.GET("/schedules/:id", trainerHandler.GetScheduleDetail)
			trainer.POST("/schedules", trainerHandler.CreateSchedule)
			trainer.PATCH("/schedules/:id", trainerHandler.UpdateSchedule)
			trainer.DELETE("/schedules/:id", trainerHandler.CancelSchedule)
			
			// Session Cards Management
			trainer.GET("/sessions", trainerHandler.GetSessions)
			trainer.GET("/sessions/:id", trainerHandler.GetSessionDetail)
			trainer.POST("/sessions", trainerHandler.CreateSessionCard)
			trainer.PATCH("/sessions/:id", trainerHandler.UpdateSessionCard)
			trainer.DELETE("/sessions/:id", trainerHandler.DeleteSessionCard)
			
			// Programs Management
			trainer.GET("/programs", trainerHandler.GetPrograms)
			trainer.GET("/programs/:id", trainerHandler.GetProgramDetail)
			trainer.POST("/programs", trainerHandler.CreateProgram)
			trainer.PATCH("/programs/:id", trainerHandler.UpdateProgram)
			trainer.DELETE("/programs/:id", trainerHandler.DeleteProgram)
			trainer.POST("/programs/:id/assign", trainerHandler.AssignProgram)
			
			// Exercise Library
			trainer.GET("/exercises", trainerHandler.GetExercises)
			trainer.POST("/exercises", trainerHandler.CreateExercise)
			trainer.PATCH("/exercises/:id", trainerHandler.UpdateExercise)
			trainer.DELETE("/exercises/:id", trainerHandler.DeleteExercise)
			
			// Analytics
			trainer.GET("/analytics/overview", trainerHandler.GetAnalyticsOverview)
			trainer.GET("/analytics/clients/:id", trainerHandler.GetClientAnalytics)
		}
		
		// ==========================================
		// Shared/Common Routes
		// ==========================================
		common := v1.Group("/common")
		common.Use(middleware.OptionalAuth(cfg)) // Optional auth
		{
			// Locations
			common.GET("/locations", locationHandler.GetLocations)
			common.GET("/locations/:id", locationHandler.GetLocationDetail)
			
			// Trainers (Public browsing)
			common.GET("/trainers", trainerHandler.GetTrainers)
			common.GET("/trainers/:id", trainerHandler.GetTrainerDetail)
			
			// Exercise Categories
			common.GET("/exercises/categories", trainerHandler.GetExerciseCategories)
		}
	}
}
