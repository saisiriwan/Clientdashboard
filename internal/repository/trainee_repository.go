package repository

import (
	"database/sql"
	"fmt"
	"time"
)

type TraineeRepository struct {
	db *sql.DB
}

func NewTraineeRepository(db *sql.DB) *TraineeRepository {
	return &TraineeRepository{db: db}
}

// ==========================================
// 1. GET /api/schedules/upcoming
// ดึงนัดหมาย 7 วันข้างหน้า
// ==========================================

type UpcomingSession struct {
	ID          int       `json:"id"`
	Date        string    `json:"date"`
	Time        string    `json:"time"`
	Duration    int       `json:"duration"`
	Title       string    `json:"title"`
	Status      string    `json:"status"`
	Trainer     Trainer   `json:"trainer"`
	Location    Location  `json:"location"`
}

type Trainer struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	ProfileImage string `json:"profileImage"`
}

type Location struct {
	Name string `json:"name"`
}

type UpcomingResponse struct {
	UpcomingSessions []UpcomingSession `json:"upcomingSessions"`
	Calendar         []CalendarDay     `json:"calendar"`
}

type CalendarDay struct {
	Date         string `json:"date"`
	DayName      string `json:"dayName"`
	IsToday      bool   `json:"isToday"`
	HasSession   bool   `json:"hasSession"`
	SessionCount int    `json:"sessionCount"`
}

func (r *TraineeRepository) GetUpcomingSchedules(clientID int, days int) (*UpcomingResponse, error) {
	if days == 0 {
		days = 7 // Default 7 days
	}

	query := `
		SELECT 
			s.id,
			s.start_time::date as date,
			s.start_time::time as time,
			s.duration,
			s.title,
			s.status,
			u.id as trainer_id,
			u.name as trainer_name,
			t.avatar_url as trainer_avatar,
			s.location
		FROM schedules s
		LEFT JOIN users u ON s.trainer_id = u.id
		LEFT JOIN trainers t ON u.id = t.user_id
		WHERE s.client_id = $1
		  AND s.start_time >= CURRENT_TIMESTAMP
		  AND s.start_time <= CURRENT_TIMESTAMP + INTERVAL '%d days'
		  AND s.status IN ('scheduled', 'confirmed')
		ORDER BY s.start_time ASC
	`

	rows, err := r.db.Query(fmt.Sprintf(query, days), clientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []UpcomingSession
	for rows.Next() {
		var s UpcomingSession
		var trainerAvatar sql.NullString
		var location sql.NullString

		err := rows.Scan(
			&s.ID,
			&s.Date,
			&s.Time,
			&s.Duration,
			&s.Title,
			&s.Status,
			&s.Trainer.ID,
			&s.Trainer.Name,
			&trainerAvatar,
			&location,
		)
		if err != nil {
			return nil, err
		}

		s.Trainer.ProfileImage = trainerAvatar.String
		s.Location.Name = location.String

		sessions = append(sessions, s)
	}

	// สร้าง Calendar 7 วัน
	calendar := make([]CalendarDay, days)
	today := time.Now()

	for i := 0; i < days; i++ {
		currentDay := today.AddDate(0, 0, i)
		calendar[i] = CalendarDay{
			Date:         currentDay.Format("2006-01-02"),
			DayName:      getThaiDayName(currentDay.Weekday()),
			IsToday:      i == 0,
			HasSession:   false,
			SessionCount: 0,
		}

		// นับจำนวน sessions ในแต่ละวัน
		for _, session := range sessions {
			if session.Date == calendar[i].Date {
				calendar[i].HasSession = true
				calendar[i].SessionCount++
			}
		}
	}

	return &UpcomingResponse{
		UpcomingSessions: sessions,
		Calendar:         calendar,
	}, nil
}

func getThaiDayName(weekday time.Weekday) string {
	days := map[time.Weekday]string{
		time.Sunday:    "วันอาทิตย์",
		time.Monday:    "วันจันทร์",
		time.Tuesday:   "วันอังคาร",
		time.Wednesday: "วันพุธ",
		time.Thursday:  "วันพฤหัสบดี",
		time.Friday:    "วันศุกร์",
		time.Saturday:  "วันเสาร์",
	}
	return days[weekday]
}

// ==========================================
// 2. GET /api/schedules/:id
// ดึงรายละเอียดนัดหมายทีละรายการ
// ==========================================

type ScheduleDetail struct {
	ID                int      `json:"id"`
	Date              string   `json:"date"`
	Time              string   `json:"time"`
	Duration          int      `json:"duration"`
	Title             string   `json:"title"`
	Description       string   `json:"description"`
	Status            string   `json:"status"`
	Trainer           TrainerDetail `json:"trainer"`
	Location          LocationDetail `json:"location"`
	SessionType       string   `json:"sessionType"`
	PlannedExercises  []string `json:"plannedExercises"`
	Notes             string   `json:"notes"`
	RelatedSessionCard *int    `json:"relatedSessionCard"`
	CreatedAt         string   `json:"createdAt"`
	UpdatedAt         string   `json:"updatedAt"`
}

type TrainerDetail struct {
	ID             int      `json:"id"`
	Name           string   `json:"name"`
	Email          string   `json:"email"`
	PhoneNumber    string   `json:"phoneNumber"`
	ProfileImage   string   `json:"profileImage"`
	Specialization []string `json:"specialization"`
}

type LocationDetail struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Address  string `json:"address"`
	Floor    string `json:"floor"`
	Building string `json:"building"`
	MapURL   string `json:"mapUrl"`
}

func (r *TraineeRepository) GetScheduleByID(scheduleID, clientID int) (*ScheduleDetail, error) {
	query := `
		SELECT 
			s.id,
			s.start_time::date as date,
			s.start_time::time as time,
			s.duration,
			s.title,
			s.description,
			s.status,
			s.session_type,
			s.planned_exercises,
			s.notes,
			s.location,
			s.created_at,
			s.updated_at,
			u.id as trainer_id,
			u.name as trainer_name,
			u.email as trainer_email,
			u.phone_number as trainer_phone,
			t.avatar_url as trainer_avatar,
			t.specialization as trainer_specialization
		FROM schedules s
		LEFT JOIN users u ON s.trainer_id = u.id
		LEFT JOIN trainers t ON u.id = t.user_id
		WHERE s.id = $1 AND s.client_id = $2
	`

	var schedule ScheduleDetail
	var description, sessionType, notes, location sql.NullString
	var plannedExercises sql.NullString
	var trainerAvatar, trainerSpecialization, trainerPhone sql.NullString

	err := r.db.QueryRow(query, scheduleID, clientID).Scan(
		&schedule.ID,
		&schedule.Date,
		&schedule.Time,
		&schedule.Duration,
		&schedule.Title,
		&description,
		&schedule.Status,
		&sessionType,
		&plannedExercises,
		&notes,
		&location,
		&schedule.CreatedAt,
		&schedule.UpdatedAt,
		&schedule.Trainer.ID,
		&schedule.Trainer.Name,
		&schedule.Trainer.Email,
		&trainerPhone,
		&trainerAvatar,
		&trainerSpecialization,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("ไม่พบนัดหมายนี้")
	}
	if err != nil {
		return nil, err
	}

	schedule.Description = description.String
	schedule.SessionType = sessionType.String
	schedule.Notes = notes.String
	schedule.Location.Name = location.String
	schedule.Trainer.ProfileImage = trainerAvatar.String
	schedule.Trainer.PhoneNumber = trainerPhone.String

	// TODO: Parse plannedExercises array และ specialization array
	// ถ้ามีข้อมูลในรูปแบบ PostgreSQL array

	return &schedule, nil
}

// ==========================================
// 3. GET /api/programs/current
// ดึงโปรแกรมปัจจุบันของ Trainee
// ==========================================

type CurrentProgram struct {
	ID                      int              `json:"id"`
	Name                    string           `json:"name"`
	Description             string           `json:"description"`
	Duration                string           `json:"duration"`
	CurrentWeek             int              `json:"currentWeek"`
	TotalWeeks              int              `json:"totalWeeks"`
	ProgressPercentage      float64          `json:"progressPercentage"`
	StartDate               string           `json:"startDate"`
	EndDate                 string           `json:"endDate"`
	Status                  string           `json:"status"`
	Trainer                 TrainerDetail    `json:"trainer"`
	SessionsCompleted       int              `json:"sessionsCompleted"`
	TotalSessions           int              `json:"totalSessions"`
	SessionCompletionRate   float64          `json:"sessionCompletionRate"`
	NextSession             *NextSession     `json:"nextSession"`
	Goals                   []string         `json:"goals"`
	WeeklySchedule          []WeeklySchedule `json:"weeklySchedule"`
	ProgressNotes           []ProgressNote   `json:"progressNotes"`
	CreatedAt               string           `json:"createdAt"`
	UpdatedAt               string           `json:"updatedAt"`
}

type NextSession struct {
	ID        int      `json:"id"`
	Date      string   `json:"date"`
	Time      string   `json:"time"`
	Title     string   `json:"title"`
	Exercises []string `json:"exercises"`
}

type WeeklySchedule struct {
	Day      string `json:"day"`
	Focus    string `json:"focus"`
	Duration int    `json:"duration"`
}

type ProgressNote struct {
	Week       int    `json:"week"`
	Date       string `json:"date"`
	Note       string `json:"note"`
	RecordedBy string `json:"recordedBy"`
}

func (r *TraineeRepository) GetCurrentProgram(clientID int) (*CurrentProgram, error) {
	query := `
		SELECT 
			p.id,
			p.name,
			p.description,
			p.duration_weeks,
			p.current_week,
			p.start_date,
			p.end_date,
			p.status,
			p.sessions_completed,
			p.total_sessions,
			p.goals,
			p.created_at,
			p.updated_at,
			u.id as trainer_id,
			u.name as trainer_name,
			u.email as trainer_email,
			u.phone_number as trainer_phone,
			t.avatar_url as trainer_avatar
		FROM programs p
		LEFT JOIN users u ON p.trainer_id = u.id
		LEFT JOIN trainers t ON u.id = t.user_id
		WHERE p.client_id = $1
		  AND p.status = 'active'
		ORDER BY p.start_date DESC
		LIMIT 1
	`

	var program CurrentProgram
	var description, startDate, endDate sql.NullString
	var currentWeek, sessionsCompleted, totalSessions sql.NullInt64
	var goals sql.NullString
	var trainerAvatar, trainerPhone sql.NullString

	err := r.db.QueryRow(query, clientID).Scan(
		&program.ID,
		&program.Name,
		&description,
		&program.TotalWeeks,
		&currentWeek,
		&startDate,
		&endDate,
		&program.Status,
		&sessionsCompleted,
		&totalSessions,
		&goals,
		&program.CreatedAt,
		&program.UpdatedAt,
		&program.Trainer.ID,
		&program.Trainer.Name,
		&program.Trainer.Email,
		&trainerPhone,
		&trainerAvatar,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("ไม่พบโปรแกรมปัจจุบัน")
	}
	if err != nil {
		return nil, err
	}

	program.Description = description.String
	program.StartDate = startDate.String
	program.EndDate = endDate.String
	program.CurrentWeek = int(currentWeek.Int64)
	program.SessionsCompleted = int(sessionsCompleted.Int64)
	program.TotalSessions = int(totalSessions.Int64)
	program.Trainer.ProfileImage = trainerAvatar.String
	program.Trainer.PhoneNumber = trainerPhone.String

	// คำนวณ Progress Percentage
	if program.TotalSessions > 0 {
		program.SessionCompletionRate = float64(program.SessionsCompleted) / float64(program.TotalSessions) * 100
		program.ProgressPercentage = program.SessionCompletionRate
	}

	program.Duration = fmt.Sprintf("%d สัปดาห์", program.TotalWeeks)

	// TODO: Parse goals array
	// TODO: ดึง NextSession จาก schedules table
	// TODO: ดึง ProgressNotes จาก program_progress_notes table

	return &program, nil
}

// ==========================================
// 4. GET /api/trainee/stats
// ดึงสถิติสรุปของ Trainee
// ==========================================

type TraineeStats struct {
	TotalSessions           int            `json:"totalSessions"`
	CompletedSessions       int            `json:"completedSessions"`
	UpcomingSessions        int            `json:"upcomingSessions"`
	CancelledSessions       int            `json:"cancelledSessions"`
	CurrentStreak           int            `json:"currentStreak"`
	LongestStreak           int            `json:"longestStreak"`
	TotalWorkoutHours       float64        `json:"totalWorkoutHours"`
	AverageSessionsPerWeek  float64        `json:"averageSessionsPerWeek"`
	CurrentProgram          *ProgramSummary `json:"currentProgram"`
	RecentAchievements      []Achievement  `json:"recentAchievements"`
}

type ProgramSummary struct {
	ID                 int     `json:"id"`
	Name               string  `json:"name"`
	ProgressPercentage float64 `json:"progressPercentage"`
	CurrentWeek        int     `json:"currentWeek"`
	TotalWeeks         int     `json:"totalWeeks"`
}

type Achievement struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Date  string `json:"date"`
	Badge string `json:"badge"`
}

func (r *TraineeRepository) GetTraineeStats(clientID int) (*TraineeStats, error) {
	stats := &TraineeStats{}

	// 1. Total Sessions
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM schedules WHERE client_id = $1
	`, clientID).Scan(&stats.TotalSessions)
	if err != nil {
		return nil, err
	}

	// 2. Completed Sessions
	err = r.db.QueryRow(`
		SELECT COUNT(*) FROM schedules WHERE client_id = $1 AND status = 'completed'
	`, clientID).Scan(&stats.CompletedSessions)
	if err != nil {
		return nil, err
	}

	// 3. Upcoming Sessions
	err = r.db.QueryRow(`
		SELECT COUNT(*) 
		FROM schedules 
		WHERE client_id = $1 
		  AND start_time >= CURRENT_TIMESTAMP
		  AND status IN ('scheduled', 'confirmed')
	`, clientID).Scan(&stats.UpcomingSessions)
	if err != nil {
		return nil, err
	}

	// 4. Cancelled Sessions
	err = r.db.QueryRow(`
		SELECT COUNT(*) FROM schedules WHERE client_id = $1 AND status = 'cancelled'
	`, clientID).Scan(&stats.CancelledSessions)
	if err != nil {
		return nil, err
	}

	// 5. Total Workout Hours
	var totalMinutes sql.NullFloat64
	err = r.db.QueryRow(`
		SELECT SUM(duration) 
		FROM schedules 
		WHERE client_id = $1 AND status = 'completed'
	`, clientID).Scan(&totalMinutes)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	stats.TotalWorkoutHours = totalMinutes.Float64 / 60.0

	// 6. Current Program
	err = r.db.QueryRow(`
		SELECT 
			id, 
			name, 
			current_week, 
			duration_weeks,
			sessions_completed,
			total_sessions
		FROM programs 
		WHERE client_id = $1 AND status = 'active'
		ORDER BY start_date DESC
		LIMIT 1
	`, clientID).Scan(
		&stats.CurrentProgram.ID,
		&stats.CurrentProgram.Name,
		&stats.CurrentProgram.CurrentWeek,
		&stats.CurrentProgram.TotalWeeks,
		// Calculate progress
	)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}

	// 7. Recent Achievements (ถ้ามี achievements table)
	// TODO: ดึงจาก achievements table

	// 8. Calculate Streaks (ต้องเขียน algorithm ตรวจสอบวันติดต่อกัน)
	// TODO: Implement streak calculation

	return stats, nil
}
