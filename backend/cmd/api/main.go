package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"fitness-training-backend/internal/config"
	"fitness-training-backend/internal/database"
	"fitness-training-backend/internal/middleware"
	"fitness-training-backend/internal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("❌ Failed to load configuration:", err)
	}

	log.Println("🔧 Configuration loaded successfully")
	log.Printf("📍 Environment: %s", cfg.Server.Env)

	// Set Gin mode
	if cfg.IsProd() {
		gin.SetMode(gin.ReleaseMode)
	}

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}
	defer database.Close()

	// Run auto-migrations
	if err := database.AutoMigrate(); err != nil {
		log.Fatal("❌ Failed to run migrations:", err)
	}

	// Seed data (development only)
	if cfg.IsDev() {
		if err := database.SeedData(); err != nil {
			log.Println("⚠️  Failed to seed data:", err)
		}
	}

	// Initialize Gin router
	router := gin.New()

	// Apply global middleware
	router.Use(gin.Recovery())
	router.Use(middleware.LoggerMiddleware())
	router.Use(middleware.CORSMiddleware(cfg))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"time":   time.Now(),
		})
	})

	// Setup routes
	routes.SetupRoutes(router, cfg)

	// Create HTTP server
	srv := &http.Server{
		Addr:         cfg.GetAddress(),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Printf("🚀 Server starting on %s", cfg.GetAddress())
		log.Printf("📡 API Base URL: http://%s/api/v1", cfg.GetAddress())
		
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("❌ Failed to start server:", err)
		}
	}()

	log.Println("✅ Server started successfully!")
	log.Println("Press Ctrl+C to stop")

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")

	// Graceful shutdown with 5 second timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("❌ Server forced to shutdown:", err)
	}

	log.Println("✅ Server exited gracefully")
}
