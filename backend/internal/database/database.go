package database

import (
	"fmt"
	"log"
	"time"

	"fitness-training-backend/internal/config"
	"fitness-training-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect initializes database connection
func Connect(cfg *config.Config) error {
	var err error

	// Configure GORM logger
	logLevel := logger.Silent
	if cfg.IsDev() {
		logLevel = logger.Info
	}

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	}

	// Connect to PostgreSQL
	DB, err = gorm.Open(postgres.Open(cfg.GetDSN()), gormConfig)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Get underlying SQL DB
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	// Configure connection pool
	sqlDB.SetMaxOpenConns(cfg.Database.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.Database.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(cfg.Database.ConnMaxLifetime)

	// Test connection
	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Database connected successfully")

	return nil
}

// Close closes database connection
func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// AutoMigrate runs database migrations
func AutoMigrate() error {
	log.Println("🔄 Running database migrations...")

	// Run auto-migration for all models
	err := DB.AutoMigrate(
		// Core
		&models.User{},
		&models.RefreshToken{},
		
		// Roles
		&models.Trainer{},
		&models.Trainee{},
		
		// Programs
		&models.Program{},
		&models.ProgramAssignment{},
		
		// Schedules & Sessions
		&models.Location{},
		&models.Schedule{},
		&models.SessionCard{},
		&models.SessionExercise{},
		&models.ExerciseSet{},
		
		// Exercise Library
		&models.ExerciseLibrary{},
		
		// Metrics & Progress
		&models.Metric{},
		&models.Achievement{},
		
		// Notifications
		&models.Notification{},
	)

	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("✅ Database migrations completed")

	return nil
}

// SeedData inserts sample data (for development only)
func SeedData() error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	log.Println("🌱 Seeding sample data...")

	// Check if data already exists
	var userCount int64
	DB.Model(&models.User{}).Count(&userCount)
	if userCount > 0 {
		log.Println("⏭️  Data already seeded, skipping...")
		return nil
	}

	// TODO: Add seed data here
	// This would include sample users, trainers, trainees, locations, etc.

	log.Println("✅ Sample data seeded successfully")

	return nil
}

// GetDB returns database instance
func GetDB() *gorm.DB {
	return DB
}

// Transaction executes a function within a database transaction
func Transaction(fn func(*gorm.DB) error) error {
	return DB.Transaction(fn)
}
