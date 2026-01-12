-- ==========================================
-- Fitness Training Management System
-- Initial Database Schema
-- Version: 1.0
-- ==========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    
    -- Profile
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('trainer', 'trainee', 'admin')),
    profile_image TEXT,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    
    -- OAuth
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    oauth_access_token TEXT,
    oauth_refresh_token TEXT,
    oauth_token_expiry TIMESTAMP,
    
    -- Security
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

-- ==========================================
-- 2. TRAINERS TABLE
-- ==========================================
CREATE TABLE trainers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    bio TEXT,
    specialization TEXT[],
    certifications TEXT[],
    experience_years INTEGER DEFAULT 0,
    
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating BETWEEN 0 AND 5),
    total_ratings INTEGER DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    
    availability VARCHAR(20) DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
    working_hours JSONB,
    
    instagram_url VARCHAR(255),
    facebook_url VARCHAR(255),
    youtube_url VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_trainers_user_id ON trainers(user_id);
CREATE INDEX idx_trainers_availability ON trainers(availability);
CREATE INDEX idx_trainers_rating ON trainers(rating DESC);

-- ==========================================
-- 3. TRAINEES TABLE
-- ==========================================
CREATE TABLE trainees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
    
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    
    goals TEXT[],
    fitness_level VARCHAR(20) CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    
    medical_notes TEXT,
    injuries TEXT[],
    allergies TEXT[],
    
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    join_date DATE DEFAULT CURRENT_DATE,
    membership_type VARCHAR(50),
    membership_expiry DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    cancelled_sessions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_workout_hours DECIMAL(10,2) DEFAULT 0.00,
    last_session_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_trainees_user_id ON trainees(user_id);
CREATE INDEX idx_trainees_trainer_id ON trainees(trainer_id);
CREATE INDEX idx_trainees_status ON trainees(status);

-- ==========================================
-- 4. LOCATIONS TABLE
-- ==========================================
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    floor VARCHAR(10),
    building VARCHAR(255),
    
    phone_number VARCHAR(20),
    email VARCHAR(255),
    
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    map_url TEXT,
    
    opening_hours VARCHAR(50),
    operating_days TEXT[],
    
    facilities TEXT[],
    images TEXT[],
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_locations_active ON locations(is_active) WHERE deleted_at IS NULL;

-- ==========================================
-- 5. PROGRAMS TABLE
-- ==========================================
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    total_weeks INTEGER NOT NULL CHECK (total_weeks > 0),
    sessions_per_week INTEGER NOT NULL CHECK (sessions_per_week > 0),
    
    goals TEXT[],
    target_fitness_level VARCHAR(20) CHECK (target_fitness_level IN ('beginner', 'intermediate', 'advanced')),
    
    weekly_schedule JSONB,
    
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    
    total_assignments INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_programs_trainer_id ON programs(trainer_id);
CREATE INDEX idx_programs_status ON programs(status);

-- ==========================================
-- 6. PROGRAM ASSIGNMENTS TABLE
-- ==========================================
CREATE TABLE program_assignments (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    trainee_id INTEGER NOT NULL REFERENCES trainees(id) ON DELETE CASCADE,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_week INTEGER DEFAULT 1,
    
    progress_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (progress_percentage BETWEEN 0 AND 100),
    sessions_completed INTEGER DEFAULT 0,
    total_sessions INTEGER NOT NULL,
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    
    notes TEXT,
    progress_notes JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT valid_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_program_assignments_program ON program_assignments(program_id);
CREATE INDEX idx_program_assignments_trainee ON program_assignments(trainee_id);
CREATE INDEX idx_program_assignments_status ON program_assignments(status);
CREATE UNIQUE INDEX idx_program_assignments_active ON program_assignments(trainee_id) 
    WHERE status = 'active' AND deleted_at IS NULL;

-- ==========================================
-- 7. SCHEDULES TABLE
-- ==========================================
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    trainee_id INTEGER NOT NULL REFERENCES trainees(id) ON DELETE CASCADE,
    location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    program_assignment_id INTEGER REFERENCES program_assignments(id) ON DELETE SET NULL,
    
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    session_type VARCHAR(50),
    planned_exercises TEXT[],
    
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    cancelled_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    session_card_id INTEGER,
    
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_schedules_trainer ON schedules(trainer_id);
CREATE INDEX idx_schedules_trainee ON schedules(trainee_id);
CREATE INDEX idx_schedules_location ON schedules(location_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_upcoming ON schedules(trainee_id, date, status) 
    WHERE status IN ('scheduled', 'confirmed');

-- ==========================================
-- 8. SESSION CARDS TABLE
-- ==========================================
CREATE TABLE session_cards (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER UNIQUE NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    trainer_id INTEGER NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    trainee_id INTEGER NOT NULL REFERENCES trainees(id) ON DELETE CASCADE,
    
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    
    overall_feedback TEXT,
    next_session_goals TEXT[],
    
    trainer_rating INTEGER CHECK (trainer_rating BETWEEN 1 AND 5),
    trainee_rating INTEGER CHECK (trainee_rating BETWEEN 1 AND 5),
    
    total_exercises INTEGER DEFAULT 0,
    total_sets INTEGER DEFAULT 0,
    total_volume DECIMAL(10,2) DEFAULT 0.00,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_session_cards_schedule ON session_cards(schedule_id);
CREATE INDEX idx_session_cards_trainer ON session_cards(trainer_id);
CREATE INDEX idx_session_cards_trainee ON session_cards(trainee_id);
CREATE INDEX idx_session_cards_date ON session_cards(date DESC);

-- ==========================================
-- 9. EXERCISE LIBRARY TABLE
-- ==========================================
CREATE TABLE exercise_library (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
    
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    
    muscle_groups TEXT[],
    equipment TEXT[],
    
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    
    instructions TEXT[],
    
    video_url TEXT,
    thumbnail_url TEXT,
    images TEXT[],
    
    is_public BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_exercise_library_trainer ON exercise_library(trainer_id);
CREATE INDEX idx_exercise_library_category ON exercise_library(category);
CREATE INDEX idx_exercise_library_public ON exercise_library(is_public) WHERE is_public = TRUE;

-- ==========================================
-- 10. SESSION EXERCISES TABLE
-- ==========================================
CREATE TABLE session_exercises (
    id SERIAL PRIMARY KEY,
    session_card_id INTEGER NOT NULL REFERENCES session_cards(id) ON DELETE CASCADE,
    exercise_library_id INTEGER REFERENCES exercise_library(id) ON DELETE SET NULL,
    
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    
    exercise_order INTEGER NOT NULL,
    
    notes TEXT,
    form_notes TEXT,
    
    total_sets INTEGER DEFAULT 0,
    total_reps INTEGER DEFAULT 0,
    total_weight DECIMAL(10,2) DEFAULT 0.00,
    total_volume DECIMAL(10,2) DEFAULT 0.00,
    
    is_pr BOOLEAN DEFAULT FALSE,
    pr_note TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_exercises_session_card ON session_exercises(session_card_id);
CREATE INDEX idx_session_exercises_library ON session_exercises(exercise_library_id);

-- ==========================================
-- 11. EXERCISE SETS TABLE
-- ==========================================
CREATE TABLE exercise_sets (
    id SERIAL PRIMARY KEY,
    session_exercise_id INTEGER NOT NULL REFERENCES session_exercises(id) ON DELETE CASCADE,
    
    set_number INTEGER NOT NULL,
    
    reps INTEGER,
    weight DECIMAL(6,2),
    
    duration INTEGER,
    distance DECIMAL(6,2),
    
    rest_duration INTEGER,
    
    completed BOOLEAN DEFAULT TRUE,
    
    rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercise_sets_session_exercise ON exercise_sets(session_exercise_id);

-- ==========================================
-- 12. METRICS TABLE
-- ==========================================
CREATE TABLE metrics (
    id SERIAL PRIMARY KEY,
    trainee_id INTEGER NOT NULL REFERENCES trainees(id) ON DELETE CASCADE,
    
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('weight', 'body_fat', 'muscle_mass', 'measurement')),
    value DECIMAL(8,2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    
    measurement_type VARCHAR(50),
    
    notes TEXT,
    
    recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_metrics_trainee ON metrics(trainee_id);
CREATE INDEX idx_metrics_date ON metrics(date DESC);
CREATE INDEX idx_metrics_type ON metrics(type);

-- ==========================================
-- 13. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(20) NOT NULL CHECK (type IN ('schedule', 'progress', 'achievement', 'system', 'message')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    related_id INTEGER,
    related_type VARCHAR(50),
    
    action_url TEXT,
    
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    sent_via TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = FALSE;

-- ==========================================
-- 14. ACHIEVEMENTS TABLE
-- ==========================================
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    trainee_id INTEGER NOT NULL REFERENCES trainees(id) ON DELETE CASCADE,
    
    type VARCHAR(20) NOT NULL CHECK (type IN ('streak', 'milestone', 'pr', 'completion')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    badge_icon TEXT,
    badge_color VARCHAR(7),
    
    value INTEGER,
    
    achieved_at TIMESTAMP NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_trainee ON achievements(trainee_id);
CREATE INDEX idx_achievements_date ON achievements(achieved_at DESC);

-- ==========================================
-- 15. REFRESH TOKENS TABLE
-- ==========================================
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    token VARCHAR(500) UNIQUE NOT NULL,
    
    expires_at TIMESTAMP NOT NULL,
    
    device_type VARCHAR(50),
    device_name VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens(expires_at);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trainers_updated_at BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trainees_updated_at BEFORE UPDATE ON trainees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER program_assignments_updated_at BEFORE UPDATE ON program_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER session_cards_updated_at BEFORE UPDATE ON session_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update trainee stats after session
CREATE OR REPLACE FUNCTION update_trainee_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE trainees
    SET 
        total_sessions = (SELECT COUNT(*) FROM session_cards WHERE trainee_id = NEW.trainee_id),
        total_workout_hours = (SELECT COALESCE(SUM(duration), 0) / 60.0 FROM session_cards WHERE trainee_id = NEW.trainee_id),
        last_session_date = NEW.date,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.trainee_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_trainee_stats
    AFTER INSERT ON session_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_trainee_stats();

-- Add session_card_id FK to schedules after creating session_cards table
ALTER TABLE schedules ADD CONSTRAINT fk_schedules_session_card 
    FOREIGN KEY (session_card_id) REFERENCES session_cards(id) ON DELETE SET NULL;
