package repository

import (
	"database/sql"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

// TestGetUpcomingSchedules_Success
func TestGetUpcomingSchedules_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewTraineeRepository(db)

	// Mock data rows
	rows := sqlmock.NewRows([]string{
		"id", "date", "time", "duration", "title", "status",
		"trainer_id", "trainer_name", "trainer_avatar", "location",
	}).
		AddRow(1, "2026-01-10", "14:00:00", 60, "Strength Training", "confirmed", 1, "โค้ชบเนศ", "avatar.jpg", "ห้องฟิตเนส A").
		AddRow(2, "2026-01-12", "10:00:00", 45, "Cardio Training", "confirmed", 1, "โค้ชบเนศ", "avatar.jpg", "ห้องคาร์ดิโอ")

	mock.ExpectQuery("SELECT (.+) FROM schedules s LEFT JOIN users u (.+)").
		WithArgs(1).
		WillReturnRows(rows)

	// Execute
	response, err := repo.GetUpcomingSchedules(1, 7)

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.Equal(t, 2, len(response.UpcomingSessions))
	assert.Equal(t, "Strength Training", response.UpcomingSessions[0].Title)
	assert.Equal(t, "confirmed", response.UpcomingSessions[0].Status)
	assert.Equal(t, 7, len(response.Calendar)) // 7 days

	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestGetUpcomingSchedules_NoSessions
func TestGetUpcomingSchedules_NoSessions(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewTraineeRepository(db)

	// Mock empty result
	rows := sqlmock.NewRows([]string{
		"id", "date", "time", "duration", "title", "status",
		"trainer_id", "trainer_name", "trainer_avatar", "location",
	})

	mock.ExpectQuery("SELECT (.+) FROM schedules s LEFT JOIN users u (.+)").
		WithArgs(1).
		WillReturnRows(rows)

	// Execute
	response, err := repo.GetUpcomingSchedules(1, 7)

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, response)
	assert.Equal(t, 0, len(response.UpcomingSessions))
	assert.Equal(t, 7, len(response.Calendar))

	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestGetScheduleByID_Success
func TestGetScheduleByID_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewTraineeRepository(db)

	// Mock single row result
	rows := sqlmock.NewRows([]string{
		"id", "date", "time", "duration", "title", "description", "status",
		"session_type", "planned_exercises", "notes", "location",
		"created_at", "updated_at",
		"trainer_id", "trainer_name", "trainer_email", "trainer_phone",
		"trainer_avatar", "trainer_specialization",
	}).
		AddRow(
			1, "2026-01-10", "14:00:00", 60, "Strength Training",
			sql.NullString{String: "เน้นกล้ามเนื้อส่วนบน", Valid: true},
			"confirmed",
			sql.NullString{String: "personal_training", Valid: true},
			sql.NullString{String: "", Valid: false},
			sql.NullString{String: "อย่าลืมนำผ้าเช็ดตัว", Valid: true},
			sql.NullString{String: "ห้องฟิตเนส A", Valid: true},
			"2026-01-03T10:00:00Z", "2026-01-05T14:30:00Z",
			1, "โค้ชบเนศ", "coach@example.com",
			sql.NullString{String: "081-234-5678", Valid: true},
			sql.NullString{String: "avatar.jpg", Valid: true},
			sql.NullString{String: "", Valid: false},
		)

	mock.ExpectQuery("SELECT (.+) FROM schedules s LEFT JOIN users u (.+)").
		WithArgs(1, 1).
		WillReturnRow(rows)

	// Execute
	schedule, err := repo.GetScheduleByID(1, 1)

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, schedule)
	assert.Equal(t, 1, schedule.ID)
	assert.Equal(t, "Strength Training", schedule.Title)
	assert.Equal(t, "เน้นกล้ามเนื้อส่วนบน", schedule.Description)
	assert.Equal(t, "confirmed", schedule.Status)
	assert.Equal(t, "โค้ชบเนศ", schedule.Trainer.Name)

	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestGetScheduleByID_NotFound
func TestGetScheduleByID_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewTraineeRepository(db)

	// Mock no rows result
	mock.ExpectQuery("SELECT (.+) FROM schedules s LEFT JOIN users u (.+)").
		WithArgs(999, 1).
		WillReturnError(sql.ErrNoRows)

	// Execute
	schedule, err := repo.GetScheduleByID(999, 1)

	// Assertions
	assert.Error(t, err)
	assert.Nil(t, schedule)
	assert.Equal(t, "ไม่พบนัดหมายนี้", err.Error())

	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestGetCurrentProgram_Success
func TestGetCurrentProgram_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewTraineeRepository(db)

	// Mock single row result
	rows := sqlmock.NewRows([]string{
		"id", "name", "description", "duration_weeks", "current_week",
		"start_date", "end_date", "status", "sessions_completed", "total_sessions",
		"goals", "created_at", "updated_at",
		"trainer_id", "trainer_name", "trainer_email", "trainer_phone", "trainer_avatar",
	}).
		AddRow(
			1, "Full Body Strength",
			sql.NullString{String: "โปรแกรมเน้นเพิ่มความแข็งแรง", Valid: true},
			12,
			sql.NullInt64{Int64: 4, Valid: true},
			sql.NullString{String: "2024-11-18", Valid: true},
			sql.NullString{String: "2025-02-10", Valid: true},
			"active",
			sql.NullInt64{Int64: 24, Valid: true},
			sql.NullInt64{Int64: 72, Valid: true},
			sql.NullString{String: "", Valid: false},
			"2024-11-18T10:00:00Z", "2026-01-10T09:00:00Z",
			1, "โค้ชบเนศ", "coach@example.com",
			sql.NullString{String: "081-234-5678", Valid: true},
			sql.NullString{String: "avatar.jpg", Valid: true},
		)

	mock.ExpectQuery("SELECT (.+) FROM programs p LEFT JOIN users u (.+)").
		WithArgs(1).
		WillReturnRow(rows)

	// Execute
	program, err := repo.GetCurrentProgram(1)

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, program)
	assert.Equal(t, 1, program.ID)
	assert.Equal(t, "Full Body Strength", program.Name)
	assert.Equal(t, "active", program.Status)
	assert.Equal(t, 4, program.CurrentWeek)
	assert.Equal(t, 12, program.TotalWeeks)
	assert.Equal(t, 24, program.SessionsCompleted)
	assert.Equal(t, 72, program.TotalSessions)
	assert.Equal(t, "12 สัปดาห์", program.Duration)

	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestGetCurrentProgram_NotFound
func TestGetCurrentProgram_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewTraineeRepository(db)

	mock.ExpectQuery("SELECT (.+) FROM programs p LEFT JOIN users u (.+)").
		WithArgs(1).
		WillReturnError(sql.ErrNoRows)

	// Execute
	program, err := repo.GetCurrentProgram(1)

	// Assertions
	assert.Error(t, err)
	assert.Nil(t, program)
	assert.Equal(t, "ไม่พบโปรแกรมปัจจุบัน", err.Error())

	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestGetTraineeStats_Success
func TestGetTraineeStats_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewTraineeRepository(db)

	// Mock total sessions
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM schedules WHERE client_id = \\$1").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(124))

	// Mock completed sessions
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM schedules WHERE client_id = \\$1 AND status = 'completed'").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(98))

	// Mock upcoming sessions
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM schedules WHERE client_id = \\$1 AND start_time >= CURRENT_TIMESTAMP").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(6))

	// Mock cancelled sessions
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM schedules WHERE client_id = \\$1 AND status = 'cancelled'").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(20))

	// Mock total workout hours
	mock.ExpectQuery("SELECT SUM\\(duration\\) FROM schedules WHERE client_id = \\$1 AND status = 'completed'").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"sum"}).AddRow(8850.0)) // 147.5 hours = 8850 minutes

	// Mock current program (optional - can return error)
	mock.ExpectQuery("SELECT id, name, current_week, duration_weeks, sessions_completed, total_sessions FROM programs").
		WithArgs(1).
		WillReturnError(sql.ErrNoRows)

	// Execute
	stats, err := repo.GetTraineeStats(1)

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, stats)
	assert.Equal(t, 124, stats.TotalSessions)
	assert.Equal(t, 98, stats.CompletedSessions)
	assert.Equal(t, 6, stats.UpcomingSessions)
	assert.Equal(t, 20, stats.CancelledSessions)
	assert.Equal(t, 147.5, stats.TotalWorkoutHours)

	assert.NoError(t, mock.ExpectationsWereMet())
}

// TestGetTraineeStats_NoData
func TestGetTraineeStats_NoData(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock db: %v", err)
	}
	defer db.Close()

	repo := NewTraineeRepository(db)

	// Mock all queries returning 0
	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM schedules WHERE client_id = \\$1").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM schedules WHERE client_id = \\$1 AND status = 'completed'").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM schedules WHERE client_id = \\$1 AND start_time >= CURRENT_TIMESTAMP").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

	mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM schedules WHERE client_id = \\$1 AND status = 'cancelled'").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(0))

	mock.ExpectQuery("SELECT SUM\\(duration\\) FROM schedules WHERE client_id = \\$1 AND status = 'completed'").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"sum"}).AddRow(sql.NullFloat64{Float64: 0, Valid: false}))

	mock.ExpectQuery("SELECT id, name, current_week, duration_weeks, sessions_completed, total_sessions FROM programs").
		WithArgs(1).
		WillReturnError(sql.ErrNoRows)

	// Execute
	stats, err := repo.GetTraineeStats(1)

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, stats)
	assert.Equal(t, 0, stats.TotalSessions)
	assert.Equal(t, 0.0, stats.TotalWorkoutHours)

	assert.NoError(t, mock.ExpectationsWereMet())
}
