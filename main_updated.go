package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

	"users/internal/config"
	"users/internal/handler"
	"users/internal/middleware"
	"users/internal/repository"
	"users/internal/service"
)

func main() {
	cfg := config.LoadConfig()

	// Debug: Log Config
	log.Printf("Attempting to connect to DB at Host: %s, Port: %s", cfg.DBHost, cfg.DBPort)

	// เชื่อมต่อ Database
	db, err := repository.ConnectDB(cfg)
	if err != nil {
		log.Printf("Failed to connect to DB: %v", err)
		log.Println("Waiting 10 minutes to allow log inspection...")
		time.Sleep(10 * time.Minute)
		return
	}
	defer db.Close()

	// --- Auto-Migration for Multi-Trainer Support ---
	log.Println("Running Auto-Migration for clients table...")
	_, _ = db.Exec(`ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_user_id_key`)
	_, _ = db.Exec(`ALTER TABLE clients DROP CONSTRAINT IF EXISTS unique_user_trainer`)
	_, err = db.Exec(`ALTER TABLE clients ADD CONSTRAINT unique_user_trainer UNIQUE (user_id, trainer_id)`)
	if err != nil {
		log.Printf("Migration Warning (might be already up to date): %v", err)
	} else {
		log.Println("Migration Success: 'unique_user_trainer' constraint applied.")
	}
	// ------------------------------------------------

	// ==========================================
	// Initialize Repositories
	// ==========================================
	userRepo := repository.NewUserRepository(db)
	trainingRepo := repository.NewTrainingRepository(db)
	exerciseRepo := repository.NewExerciseRepository(db)
	dashboardRepo := repository.NewDashboardRepository(db)
	clientRepo := repository.NewClientRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	programRepo := repository.NewProgramRepository(db)
	calendarNoteRepo := repository.NewCalendarNoteRepository(db)

	// 🔥 NEW: Trainee & Notification Repositories
	traineeRepo := repository.NewTraineeRepository(db)
	notificationRepo := repository.NewNotificationRepository(db)

	// ==========================================
	// Initialize Services
	// ==========================================
	userService := service.NewUserService(userRepo)

	// ==========================================
	// Initialize Handlers
	// ==========================================
	userHandler := handler.NewUserHandler(userService)
	trainingHandler := handler.NewTrainingHandler(trainingRepo, userService)
	exerciseHandler := handler.NewExerciseHandler(exerciseRepo)
	dashboardHandler := handler.NewDashboardHandler(dashboardRepo)
	clientHandler := handler.NewClientHandler(clientRepo, userService)
	sessionHandler := handler.NewSessionHandler(sessionRepo)
	programHandler := handler.NewProgramHandler(programRepo)
	calendarNoteHandler := handler.NewCalendarNoteHandler(calendarNoteRepo)

	// 🔥 NEW: Trainee & Notification Handlers
	traineeHandler := handler.NewTraineeHandler(traineeRepo)
	notificationHandler := handler.NewNotificationHandler(notificationRepo)

	// ==========================================
	// Initialize Gin Router
	// ==========================================
	r := gin.Default()

	// CORS Middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Static Files
	r.Static("/uploads", "./uploads")

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		if err := repository.CheckDBConnection(db); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"detail": "Database connection failed"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "healthy", "database": "connected"})
	})

	apiV1 := r.Group("/api/v1")

	// ==========================================
	// 1. PUBLIC ROUTES (Auth)
	// ==========================================
	authRoutes := apiV1.Group("/auth")
	{
		authRoutes.POST("/register", userHandler.Register)
		authRoutes.POST("/login", userHandler.Login)
		authRoutes.POST("/logout", userHandler.Logout)
		authRoutes.GET("/google/login", userHandler.GoogleLogin)
		authRoutes.GET("/google/callback", userHandler.GoogleCallback)
	}

	// Google Callback at root level
	r.GET("/auth/google/callback", userHandler.GoogleCallback)

	// ==========================================
	// 2. PROTECTED ROUTES (Require Authentication)
	// ==========================================
	protected := apiV1.Group("/")
	protected.Use(middleware.JWTCookieAuth())
	{
		// Check Auth (ทั้ง Trainer และ Trainee ใช้ได้)
		protected.GET("/auth/me", userHandler.CheckAuth)

		// ==========================================
		// 🔥 TRAINEE ROUTES (Read-Only)
		// ==========================================
		traineeRoutes := protected.Group("/trainee")
		traineeRoutes.Use(middleware.RequireTrainee())
		{
			// ✅ 1. GET /api/v1/trainee/schedules/upcoming - นัดหมาย 7 วันข้างหน้า
			traineeRoutes.GET("/schedules/upcoming", traineeHandler.GetUpcomingSchedules)

			// ✅ 2. GET /api/v1/trainee/schedules/:id - รายละเอียดนัดหมาย
			traineeRoutes.GET("/schedules/:id", traineeHandler.GetScheduleByID)

			// ✅ 3. GET /api/v1/trainee/programs/current - โปรแกรมปัจจุบัน
			traineeRoutes.GET("/programs/current", traineeHandler.GetCurrentProgram)

			// ✅ 4. GET /api/v1/trainee/stats - สถิติสรุป
			traineeRoutes.GET("/stats", traineeHandler.GetTraineeStats)

			// ✅ 5. GET /api/v1/trainee/notifications - การแจ้งเตือน
			traineeRoutes.GET("/notifications", notificationHandler.GetNotifications)

			// ✅ 6. PUT /api/v1/trainee/notifications/:id/read - Mark as Read
			traineeRoutes.PUT("/notifications/:id/read", notificationHandler.MarkAsRead)

			// ✅ 7. PUT /api/v1/trainee/notifications/read-all - Mark All as Read
			traineeRoutes.PUT("/notifications/read-all", notificationHandler.MarkAllAsRead)

			// ✅ 8. GET /api/v1/trainee/me - โปรไฟล์ของฉัน
			traineeRoutes.GET("/me", clientHandler.GetMyProfile)

			// ✅ 9. GET /api/v1/trainee/schedules - ตารางนัดหมายทั้งหมด (with filters)
			traineeRoutes.GET("/schedules", trainingHandler.GetSchedules)

			// ✅ 10. GET /api/v1/trainee/sessions - Session Cards ทั้งหมด
			traineeRoutes.GET("/sessions", sessionHandler.GetClientSessions)

			// ✅ 11. GET /api/v1/trainee/sessions/:id - รายละเอียด Session Card
			traineeRoutes.GET("/sessions/:id", sessionHandler.GetSession)

			// ✅ 12. GET /api/v1/trainee/metrics - ข้อมูลการวัดผล
			traineeRoutes.GET("/metrics", clientHandler.GetMetrics)

			// ✅ 13. GET /api/v1/trainee/programs - รายการโปรแกรมทั้งหมด
			traineeRoutes.GET("/programs", programHandler.GetPrograms)

			// ✅ 14. GET /api/v1/trainee/programs/:id - รายละเอียดโปรแกรม
			traineeRoutes.GET("/programs/:id", programHandler.GetProgramDetail)
		}

		// ==========================================
		// 🔥 TRAINER ROUTES (Full CRUD)
		// ==========================================
		trainerRoutes := protected.Group("/trainer")
		trainerRoutes.Use(middleware.RequireTrainer())
		{
			// User Management
			trainerRoutes.DELETE("/users/:id", userHandler.DeleteUser)
			trainerRoutes.PUT("/users/:id", userHandler.UpdateUser)
			trainerRoutes.POST("/users/upload-avatar", userHandler.UploadAvatar)
			trainerRoutes.GET("/users", userHandler.GetAllUsers)
			trainerRoutes.GET("/users/:id", userHandler.GetUserByID)

			// Schedules Management
			trainerRoutes.POST("/schedules", trainingHandler.CreateSchedule)
			trainerRoutes.PUT("/schedules/:id", trainingHandler.UpdateSchedule)
			trainerRoutes.DELETE("/schedules/:id", trainingHandler.DeleteSchedule)
			trainerRoutes.GET("/schedules", trainingHandler.GetSchedules)

			// Assignments Management
			trainerRoutes.GET("/assignments", trainingHandler.GetAssignments)
			trainerRoutes.POST("/assignments", trainingHandler.CreateAssignment)
			trainerRoutes.PUT("/assignments/:id", trainingHandler.UpdateAssignment)
			trainerRoutes.DELETE("/assignments/:id", trainingHandler.DeleteAssignment)

			// Dashboard
			trainerRoutes.GET("/dashboard/stats", dashboardHandler.GetDashboardStats)

			// Clients Management
			trainerRoutes.GET("/clients", trainingHandler.GetClients)
			trainerRoutes.POST("/clients", trainingHandler.CreateClient)
			trainerRoutes.GET("/clients/:id", trainingHandler.GetClientByID)
			trainerRoutes.PUT("/clients/:id", clientHandler.UpdateClient)
			trainerRoutes.DELETE("/clients/:id", clientHandler.DeleteClient)
			trainerRoutes.GET("/clients/:id/metrics", clientHandler.GetMetrics)
			trainerRoutes.POST("/clients/:id/metrics", clientHandler.CreateMetric)
			trainerRoutes.GET("/clients/:id/notes", clientHandler.GetClientNotes)
			trainerRoutes.POST("/clients/:id/notes", clientHandler.CreateClientNote)

			// Sessions Management
			trainerRoutes.POST("/sessions", sessionHandler.CreateSession)
			trainerRoutes.GET("/sessions/:id", sessionHandler.GetSession)
			trainerRoutes.GET("/clients/:id/sessions", sessionHandler.GetClientSessions)
			trainerRoutes.PUT("/sessions/:id", sessionHandler.UpdateSession)
			trainerRoutes.POST("/sessions/:id/logs", sessionHandler.CreateLog)
			trainerRoutes.PUT("/sessions/:id/sets/:setId", sessionHandler.UpdateSet)
			trainerRoutes.DELETE("/sessions/:id", sessionHandler.DeleteSession)
			trainerRoutes.PATCH("/sessions/:id", sessionHandler.RescheduleSession)

			// Programs Management
			trainerRoutes.GET("/programs", programHandler.GetPrograms)
			trainerRoutes.POST("/programs", programHandler.CreateProgram)
			trainerRoutes.GET("/programs/:id", programHandler.GetProgramDetail)
			trainerRoutes.PUT("/programs/:id", programHandler.UpdateProgram)
			trainerRoutes.DELETE("/programs/:id", programHandler.DeleteProgram)
			trainerRoutes.POST("/programs/:id/assign", programHandler.AssignProgram)

			// Program Days
			trainerRoutes.POST("/program-days", programHandler.CreateDay)
			trainerRoutes.PUT("/program-days/:id", programHandler.UpdateDay)
			trainerRoutes.DELETE("/program-days/:id", programHandler.DeleteDay)

			// Program Sections
			trainerRoutes.POST("/program-sections", programHandler.CreateSection)
			trainerRoutes.PUT("/program-sections/:id", programHandler.UpdateSection)
			trainerRoutes.DELETE("/program-sections/:id", programHandler.DeleteSection)

			// Program Exercises
			trainerRoutes.POST("/program-exercises", programHandler.AddExercise)
			trainerRoutes.PUT("/program-exercises/:id", programHandler.UpdateExercise)
			trainerRoutes.DELETE("/program-exercises/:exerciseId", programHandler.DeleteExercise)

			// Exercise Library
			trainerRoutes.GET("/exercises", exerciseHandler.GetExercises)
			trainerRoutes.POST("/exercises", exerciseHandler.CreateExercise)
			trainerRoutes.PUT("/exercises/:id", exerciseHandler.UpdateExercise)
			trainerRoutes.DELETE("/exercises/:id", exerciseHandler.DeleteExercise)

			// Calendar Notes
			trainerRoutes.GET("/calendar/notes", calendarNoteHandler.GetNotes)
			trainerRoutes.POST("/calendar/notes", calendarNoteHandler.CreateNote)
			trainerRoutes.DELETE("/calendar/notes/:id", calendarNoteHandler.DeleteNote)
		}

		// ==========================================
		// 🔥 SHARED ROUTES (Both Trainer & Trainee)
		// ==========================================
		// Exercise Library (Read-Only for Trainee)
		protected.GET("/exercises", middleware.AllowAll(), exerciseHandler.GetExercises)
	}

	log.Println("✅ Server started successfully!")
	log.Println("🔥 RBAC Middleware: ENABLED")
	log.Println("📋 Trainee Routes: /api/v1/trainee/* (Read-Only)")
	log.Println("👨‍🏫 Trainer Routes: /api/v1/trainer/* (Full CRUD)")
	log.Println("🚀 Server running on :8080")

	r.Run(":8080")
}
