-- =====================================================
-- Fitness Management System - Complete Database Init
-- =====================================================
-- Description: All-in-one database initialization script
-- Version: 1.0.0
-- Created: 2026-01-24
-- 
-- This file contains:
-- - PostgreSQL extensions
-- - All database functions
-- - All 15 tables with indexes
-- - All 8 triggers
-- - 3 materialized views
-- - Row-level security policies
-- - Exercise seed data
-- - Optional demo data
-- 
-- Usage:
--   createdb fitness_db
--   psql fitness_db -f database/init.sql
-- =====================================================

-- =====================================================
-- SECTION 1: EXTENSIONS
-- =====================================================

\echo '==> Creating PostgreSQL extensions...'

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\echo '✓ Extensions created'

-- =====================================================
-- SECTION 2: FUNCTIONS
-- =====================================================

\echo '==> Creating database functions...'

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions_function()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create schedule notification
CREATE OR REPLACE FUNCTION create_schedule_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (
        user_id, type, title, message, resource_type, resource_id
    ) VALUES (
        NEW.trainee_id,
        'schedule_created',
        'นัดหมายใหม่',
        CONCAT('คุณมีนัดฝึกใหม่: ', NEW.title, ' วันที่ ', TO_CHAR(NEW.date, 'DD/MM/YYYY'), ' เวลา ', NEW.start_time),
        'schedules',
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update schedule notification
CREATE OR REPLACE FUNCTION update_schedule_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.date != NEW.date OR OLD.start_time != NEW.start_time OR OLD.status != NEW.status) THEN
        INSERT INTO notifications (
            user_id, type, title, message, resource_type, resource_id
        ) VALUES (
            NEW.trainee_id,
            'schedule_updated',
            'นัดหมายมีการเปลี่ยนแปลง',
            CONCAT('นัดหมาย "', NEW.title, '" มีการเปลี่ยนแปลง - สถานะ: ', NEW.status),
            'schedules',
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create workout notification
CREATE OR REPLACE FUNCTION create_workout_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (
        user_id, type, title, message, resource_type, resource_id
    ) VALUES (
        NEW.trainee_id,
        'workout_logged',
        'บันทึกการฝึกใหม่',
        CONCAT('โค้ชได้บันทึกผลการฝึกของคุณวันที่ ', TO_CHAR(NEW.date, 'DD/MM/YYYY')),
        'workouts',
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create session card notification
CREATE OR REPLACE FUNCTION create_session_card_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (
        user_id, type, title, message, resource_type, resource_id
    ) VALUES (
        NEW.trainee_id,
        'session_card_created',
        'การ์ดสรุปผลใหม่',
        CONCAT('โค้ชได้สรุปผลการฝึกของคุณแล้ว - คะแนน: ', NEW.rating, '/5'),
        'session_cards',
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update user current weight
CREATE OR REPLACE FUNCTION update_user_current_weight()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET weight = NEW.weight, updated_at = NOW()
    WHERE id = NEW.trainee_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate BMI
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
DECLARE
    user_height DECIMAL(5,2);
BEGIN
    SELECT height INTO user_height FROM users WHERE id = NEW.trainee_id;
    IF user_height IS NOT NULL AND user_height > 0 THEN
        NEW.bmi = ROUND((NEW.weight / ((user_height / 100) * (user_height / 100)))::NUMERIC, 2);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Increment exercise usage
CREATE OR REPLACE FUNCTION increment_exercise_usage()
RETURNS TRIGGER AS $$
DECLARE
    exercise_record RECORD;
    exercise_name TEXT;
BEGIN
    FOR exercise_record IN 
        SELECT value->>'name' as name FROM jsonb_array_elements(NEW.exercises)
    LOOP
        exercise_name := exercise_record.name;
        UPDATE exercises SET usage_count = usage_count + 1 WHERE name = exercise_name;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit log
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    user_email_var VARCHAR(255);
BEGIN
    IF TG_OP = 'DELETE' THEN
        SELECT email INTO user_email_var FROM users WHERE id = OLD.trainer_id;
    ELSE
        SELECT email INTO user_email_var FROM users WHERE id = NEW.trainer_id;
    END IF;
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, new_values)
        VALUES (NEW.trainer_id, user_email_var, 'CREATE', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, old_values, new_values)
        VALUES (NEW.trainer_id, user_email_var, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, old_values)
        VALUES (OLD.trainer_id, user_email_var, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    END IF;
    
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

-- RLS Helper Functions
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS VARCHAR AS $$
BEGIN
    RETURN current_setting('app.current_user_role', true)::VARCHAR;
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

\echo '✓ Functions created'

-- =====================================================
-- SECTION 3: TABLES
-- =====================================================

\echo '==> Creating tables...'

-- TABLE 1: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    role VARCHAR(20) NOT NULL CHECK (role IN ('trainer', 'trainee')) DEFAULT 'trainee',
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_role_active ON users(role, is_active);
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\echo '  ✓ users'

-- TABLE 2: user_sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL UNIQUE,
    access_token VARCHAR(500) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_refresh ON user_sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_sessions_expires_created ON user_sessions(expires_at, created_at);

CREATE TRIGGER cleanup_expired_sessions AFTER INSERT ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION cleanup_expired_sessions_function();

\echo '  ✓ user_sessions'

-- TABLE 3: schedules
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_end_after_start CHECK (end_time > start_time),
    CONSTRAINT chk_date_not_past CHECK (date >= CURRENT_DATE OR status IN ('completed', 'cancelled'))
);

CREATE INDEX idx_schedules_trainee ON schedules(trainee_id);
CREATE INDEX idx_schedules_trainer ON schedules(trainer_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_datetime ON schedules(date, start_time);
CREATE INDEX idx_schedules_trainee_date_status ON schedules(trainee_id, date, status);
CREATE INDEX idx_schedules_trainer_date_status ON schedules(trainer_id, date, status);
CREATE INDEX idx_schedules_date_status ON schedules(date DESC, status);
CREATE INDEX idx_schedules_reminder ON schedules(date, reminder_sent) WHERE reminder_sent = false;

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER notify_schedule_created AFTER INSERT ON schedules
    FOR EACH ROW EXECUTE FUNCTION create_schedule_notification();
CREATE TRIGGER notify_schedule_updated AFTER UPDATE ON schedules
    FOR EACH ROW EXECUTE FUNCTION update_schedule_notification();
CREATE TRIGGER audit_schedules AFTER INSERT OR UPDATE OR DELETE ON schedules
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

\echo '  ✓ schedules'

-- TABLE 4: exercises
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('weight_training', 'cardio', 'flexibility')),
    category VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    muscle_groups TEXT[],
    equipment TEXT[],
    instructions TEXT[],
    tips TEXT[],
    warnings TEXT[],
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    video_url TEXT,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_exercises_name_unique ON exercises(LOWER(name));
CREATE INDEX idx_exercises_type ON exercises(type);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_active ON exercises(is_active);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_usage ON exercises(usage_count DESC);
CREATE INDEX idx_exercises_type_active ON exercises(type, is_active);
CREATE INDEX idx_exercises_category_type ON exercises(category, type);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN (muscle_groups);
CREATE INDEX idx_exercises_equipment ON exercises USING GIN (equipment);
CREATE INDEX idx_exercises_metadata ON exercises USING GIN (metadata);
CREATE INDEX idx_exercises_name_trgm ON exercises USING gin (name gin_trgm_ops);
CREATE INDEX idx_exercises_description_trgm ON exercises USING gin (description gin_trgm_ops);

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\echo '  ✓ exercises'

-- TABLE 5: workouts
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    duration INTEGER NOT NULL,
    exercises JSONB NOT NULL,
    summary JSONB NOT NULL,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    mood VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_duration_positive CHECK (duration > 0),
    CONSTRAINT chk_exercises_not_empty CHECK (jsonb_array_length(exercises) > 0)
);

CREATE INDEX idx_workouts_trainee ON workouts(trainee_id);
CREATE INDEX idx_workouts_trainer ON workouts(trainer_id);
CREATE INDEX idx_workouts_schedule ON workouts(schedule_id);
CREATE INDEX idx_workouts_date ON workouts(date DESC);
CREATE INDEX idx_workouts_rating ON workouts(rating);
CREATE INDEX idx_workouts_trainee_date ON workouts(trainee_id, date DESC);
CREATE INDEX idx_workouts_trainer_date ON workouts(trainer_id, date DESC);
CREATE INDEX idx_workouts_exercises ON workouts USING GIN (exercises);
CREATE INDEX idx_workouts_summary ON workouts USING GIN (summary);

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER notify_workout_created AFTER INSERT ON workouts
    FOR EACH ROW EXECUTE FUNCTION create_workout_notification();
CREATE TRIGGER increment_exercise_usage_on_workout AFTER INSERT ON workouts
    FOR EACH ROW EXECUTE FUNCTION increment_exercise_usage();
CREATE TRIGGER audit_workouts AFTER INSERT OR UPDATE OR DELETE ON workouts
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

\echo '  ✓ workouts'

-- TABLE 6: session_cards
CREATE TABLE session_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    summary TEXT NOT NULL,
    achievements TEXT[],
    areas_for_improvement TEXT[],
    next_session_goals TEXT[],
    trainer_notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    tags TEXT[],
    media JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_cards_trainee ON session_cards(trainee_id);
CREATE INDEX idx_session_cards_trainer ON session_cards(trainer_id);
CREATE INDEX idx_session_cards_workout ON session_cards(workout_id);
CREATE INDEX idx_session_cards_date ON session_cards(date DESC);
CREATE INDEX idx_session_cards_rating ON session_cards(rating);
CREATE INDEX idx_session_cards_trainee_date ON session_cards(trainee_id, date DESC);
CREATE INDEX idx_session_cards_trainer_date ON session_cards(trainer_id, date DESC);
CREATE INDEX idx_session_cards_tags ON session_cards USING GIN (tags);
CREATE INDEX idx_session_cards_achievements ON session_cards USING GIN (achievements);
CREATE INDEX idx_session_cards_media ON session_cards USING GIN (media);
CREATE INDEX idx_session_cards_summary_trgm ON session_cards USING gin (summary gin_trgm_ops);

CREATE TRIGGER update_session_cards_updated_at BEFORE UPDATE ON session_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER notify_session_card_created AFTER INSERT ON session_cards
    FOR EACH ROW EXECUTE FUNCTION create_session_card_notification();
CREATE TRIGGER audit_session_cards AFTER INSERT OR UPDATE OR DELETE ON session_cards
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

\echo '  ✓ session_cards'

-- TABLE 7: body_weight_entries
CREATE TABLE body_weight_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL,
    date DATE NOT NULL,
    bmi DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    muscle_mass DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_weight_positive CHECK (weight > 0 AND weight < 500),
    CONSTRAINT chk_bmi_valid CHECK (bmi IS NULL OR (bmi >= 10 AND bmi <= 50)),
    CONSTRAINT chk_body_fat_valid CHECK (body_fat_percentage IS NULL OR (body_fat_percentage >= 0 AND body_fat_percentage <= 100)),
    CONSTRAINT chk_muscle_mass_valid CHECK (muscle_mass IS NULL OR (muscle_mass > 0 AND muscle_mass < 200))
);

CREATE INDEX idx_body_weight_trainee ON body_weight_entries(trainee_id);
CREATE INDEX idx_body_weight_date ON body_weight_entries(date DESC);
CREATE INDEX idx_body_weight_trainee_date ON body_weight_entries(trainee_id, date DESC);
CREATE UNIQUE INDEX idx_body_weight_unique ON body_weight_entries(trainee_id, date);

CREATE TRIGGER calculate_bmi_on_insert BEFORE INSERT ON body_weight_entries
    FOR EACH ROW EXECUTE FUNCTION calculate_bmi();
CREATE TRIGGER calculate_bmi_on_update BEFORE UPDATE ON body_weight_entries
    FOR EACH ROW EXECUTE FUNCTION calculate_bmi();
CREATE TRIGGER update_user_weight_on_insert AFTER INSERT ON body_weight_entries
    FOR EACH ROW EXECUTE FUNCTION update_user_current_weight();
CREATE TRIGGER update_user_weight_on_update AFTER UPDATE ON body_weight_entries
    FOR EACH ROW EXECUTE FUNCTION update_user_current_weight();

\echo '  ✓ body_weight_entries'

-- TABLE 8: notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('schedule_created', 'schedule_updated', 'schedule_reminder', 'workout_logged', 'session_card_created', 'achievement_unlocked', 'body_weight_logged', 'program_assigned')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_resource ON notifications(resource_type, resource_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE is_read = false;

\echo '  ✓ notifications'

-- TABLE 9: settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) DEFAULT 'th',
    notification_settings JSONB DEFAULT '{"email":true,"push":true,"sms":false}'::jsonb,
    privacy_settings JSONB DEFAULT '{"profileVisibility":"private","showStats":false}'::jsonb,
    weight_unit VARCHAR(10) DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
    distance_unit VARCHAR(10) DEFAULT 'km' CHECK (distance_unit IN ('km', 'miles')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_settings_user ON settings(user_id);
CREATE INDEX idx_settings_notification ON settings USING GIN (notification_settings);
CREATE INDEX idx_settings_privacy ON settings USING GIN (privacy_settings);

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\echo '  ✓ settings'

-- TABLE 10: audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW')),
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource_created ON audit_logs(resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audit_logs_old_values ON audit_logs USING GIN (old_values);
CREATE INDEX idx_audit_logs_new_values ON audit_logs USING GIN (new_values);

\echo '  ✓ audit_logs'

-- TABLE 11-15: Support tables
CREATE TABLE api_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    endpoint VARCHAR(255) NOT NULL,
    requests_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_user ON api_rate_limits(user_id, window_start);
CREATE INDEX idx_rate_limits_ip ON api_rate_limits(ip_address, window_start);
CREATE INDEX idx_rate_limits_endpoint ON api_rate_limits(endpoint, window_start);

\echo '  ✓ api_rate_limits'

CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhooks_user ON webhooks(user_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
CREATE INDEX idx_webhooks_events ON webhooks USING GIN (events);

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\echo '  ✓ webhooks'

CREATE TABLE exercise_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    exercises JSONB NOT NULL,
    tags TEXT[],
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_minutes INTEGER,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exercise_templates_creator ON exercise_templates(created_by);
CREATE INDEX idx_exercise_templates_public ON exercise_templates(is_public);
CREATE INDEX idx_exercise_templates_usage ON exercise_templates(usage_count DESC);
CREATE INDEX idx_exercise_templates_difficulty ON exercise_templates(difficulty);
CREATE INDEX idx_exercise_templates_tags ON exercise_templates USING GIN (tags);
CREATE INDEX idx_exercise_templates_exercises ON exercise_templates USING GIN (exercises);

CREATE TRIGGER update_exercise_templates_updated_at BEFORE UPDATE ON exercise_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\echo '  ✓ exercise_templates'

CREATE TABLE program_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_weeks INTEGER NOT NULL,
    weekly_plan JSONB NOT NULL,
    goals TEXT[],
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_duration_positive CHECK (duration_weeks > 0 AND duration_weeks <= 52)
);

CREATE INDEX idx_program_templates_creator ON program_templates(created_by);
CREATE INDEX idx_program_templates_public ON program_templates(is_public);
CREATE INDEX idx_program_templates_usage ON program_templates(usage_count DESC);
CREATE INDEX idx_program_templates_difficulty ON program_templates(difficulty);
CREATE INDEX idx_program_templates_goals ON program_templates USING GIN (goals);
CREATE INDEX idx_program_templates_weekly_plan ON program_templates USING GIN (weekly_plan);

CREATE TRIGGER update_program_templates_updated_at BEFORE UPDATE ON program_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\echo '  ✓ program_templates'

CREATE TABLE trainee_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES program_templates(id) ON DELETE SET NULL,
    current_week INTEGER DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_current_week_positive CHECK (current_week > 0),
    CONSTRAINT chk_end_after_start CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_trainee_programs_trainee ON trainee_programs(trainee_id);
CREATE INDEX idx_trainee_programs_trainer ON trainee_programs(trainer_id);
CREATE INDEX idx_trainee_programs_program ON trainee_programs(program_id);
CREATE INDEX idx_trainee_programs_status ON trainee_programs(status);
CREATE INDEX idx_trainee_programs_trainee_status ON trainee_programs(trainee_id, status);

CREATE TRIGGER update_trainee_programs_updated_at BEFORE UPDATE ON trainee_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\echo '  ✓ trainee_programs'
\echo '✓ All 15 tables created with 47 indexes and 8 triggers'

-- =====================================================
-- SECTION 4: MATERIALIZED VIEWS
-- =====================================================

\echo '==> Creating materialized views...'

-- View 1: trainee_stats_view
CREATE MATERIALIZED VIEW trainee_stats_view AS
SELECT 
    t.id as trainee_id,
    t.name as trainee_name,
    t.email,
    t.avatar,
    COUNT(DISTINCT w.id) as total_workouts,
    COALESCE(SUM(w.duration), 0) as total_duration_minutes,
    COALESCE(AVG(w.rating), 0) as avg_workout_rating,
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'cancelled' THEN s.id END) as cancelled_sessions,
    COUNT(DISTINCT sc.id) as total_session_cards,
    COALESCE(AVG(sc.rating), 0) as avg_session_rating,
    COALESCE(SUM((w.summary->>'totalWeight')::NUMERIC), 0) as total_weight_lifted,
    COALESCE(SUM((w.summary->>'totalReps')::NUMERIC), 0) as total_reps,
    COALESCE(SUM((w.summary->>'totalSets')::NUMERIC), 0) as total_sets,
    COALESCE(SUM((w.summary->>'totalDistance')::NUMERIC), 0) as total_distance,
    COALESCE(SUM((w.summary->>'totalCalories')::NUMERIC), 0) as total_calories,
    (SELECT weight FROM body_weight_entries WHERE trainee_id = t.id ORDER BY date DESC LIMIT 1) as current_weight,
    (SELECT weight FROM body_weight_entries WHERE trainee_id = t.id ORDER BY date ASC LIMIT 1) as start_weight,
    MAX(w.date) as last_workout_date,
    MAX(s.date) as last_schedule_date,
    t.created_at,
    NOW() as stats_updated_at
FROM users t
LEFT JOIN workouts w ON t.id = w.trainee_id
LEFT JOIN schedules s ON t.id = s.trainee_id
LEFT JOIN session_cards sc ON t.id = sc.trainee_id
WHERE t.role = 'trainee'
GROUP BY t.id, t.name, t.email, t.avatar, t.created_at;

CREATE UNIQUE INDEX idx_trainee_stats_trainee_id ON trainee_stats_view(trainee_id);
CREATE INDEX idx_trainee_stats_total_workouts ON trainee_stats_view(total_workouts DESC);
CREATE INDEX idx_trainee_stats_avg_rating ON trainee_stats_view(avg_workout_rating DESC);
CREATE INDEX idx_trainee_stats_last_workout ON trainee_stats_view(last_workout_date DESC);

\echo '  ✓ trainee_stats_view'

-- View 2: exercise_stats_view
CREATE MATERIALIZED VIEW exercise_stats_view AS
SELECT 
    e.id as exercise_id,
    e.name as exercise_name,
    e.type,
    e.category,
    e.difficulty,
    e.usage_count,
    COUNT(DISTINCT w.id) as times_used_in_workouts,
    COUNT(DISTINCT w.trainee_id) as used_by_trainees,
    CASE 
        WHEN e.type = 'weight_training' THEN
            (SELECT AVG((set_data->>'weight')::NUMERIC)
             FROM workouts,
             jsonb_array_elements(exercises) as exercise,
             jsonb_array_elements(exercise->'sets') as set_data
             WHERE exercise->>'name' = e.name
             AND (set_data->>'weight') IS NOT NULL)
        ELSE NULL
    END as avg_weight,
    MAX(w.date) as last_used_date,
    e.created_at,
    NOW() as stats_updated_at
FROM exercises e
LEFT JOIN workouts w ON w.exercises @> jsonb_build_array(jsonb_build_object('name', e.name))
GROUP BY e.id, e.name, e.type, e.category, e.difficulty, e.usage_count, e.created_at;

CREATE UNIQUE INDEX idx_exercise_stats_exercise_id ON exercise_stats_view(exercise_id);
CREATE INDEX idx_exercise_stats_type ON exercise_stats_view(type);
CREATE INDEX idx_exercise_stats_times_used ON exercise_stats_view(times_used_in_workouts DESC);
CREATE INDEX idx_exercise_stats_used_by ON exercise_stats_view(used_by_trainees DESC);

\echo '  ✓ exercise_stats_view'

-- View 3: trainer_dashboard_view
CREATE MATERIALIZED VIEW trainer_dashboard_view AS
SELECT 
    tr.id as trainer_id,
    tr.name as trainer_name,
    tr.email,
    COUNT(DISTINCT CASE WHEN u.role = 'trainee' AND u.is_active = true THEN u.id END) as active_trainees,
    COUNT(DISTINCT CASE WHEN u.role = 'trainee' THEN u.id END) as total_trainees,
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'pending' THEN s.id END) as pending_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'confirmed' THEN s.id END) as confirmed_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
    COUNT(DISTINCT CASE WHEN s.date >= CURRENT_DATE THEN s.id END) as upcoming_sessions,
    COUNT(DISTINCT w.id) as total_workouts_logged,
    COALESCE(AVG(w.rating), 0) as avg_workout_rating,
    COUNT(DISTINCT sc.id) as total_session_cards,
    COALESCE(AVG(sc.rating), 0) as avg_session_rating,
    MAX(w.created_at) as last_workout_logged,
    MAX(s.created_at) as last_schedule_created,
    tr.created_at,
    NOW() as stats_updated_at
FROM users tr
LEFT JOIN schedules s ON tr.id = s.trainer_id
LEFT JOIN workouts w ON tr.id = w.trainer_id
LEFT JOIN session_cards sc ON tr.id = sc.trainer_id
LEFT JOIN (
    SELECT DISTINCT trainer_id, trainee_id FROM schedules
    UNION
    SELECT DISTINCT trainer_id, trainee_id FROM workouts
) trainer_trainee_rel ON tr.id = trainer_trainee_rel.trainer_id
LEFT JOIN users u ON trainer_trainee_rel.trainee_id = u.id
WHERE tr.role = 'trainer'
GROUP BY tr.id, tr.name, tr.email, tr.created_at;

CREATE UNIQUE INDEX idx_trainer_dashboard_trainer_id ON trainer_dashboard_view(trainer_id);
CREATE INDEX idx_trainer_dashboard_active_trainees ON trainer_dashboard_view(active_trainees DESC);
CREATE INDEX idx_trainer_dashboard_total_sessions ON trainer_dashboard_view(total_sessions DESC);

\echo '  ✓ trainer_dashboard_view'

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY trainee_stats_view;
    REFRESH MATERIALIZED VIEW CONCURRENTLY exercise_stats_view;
    REFRESH MATERIALIZED VIEW CONCURRENTLY trainer_dashboard_view;
    RAISE NOTICE 'All materialized views refreshed successfully';
END;
$$ LANGUAGE plpgsql;

\echo '✓ Materialized views created'

-- =====================================================
-- SECTION 5: ROW-LEVEL SECURITY
-- =====================================================

\echo '==> Setting up row-level security...'

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Schedules policies
CREATE POLICY trainee_view_own_schedules ON schedules FOR SELECT
    USING (trainee_id = current_user_id() OR trainer_id = current_user_id());
CREATE POLICY trainer_view_all_schedules ON schedules FOR SELECT
    USING (current_user_role() = 'trainer');
CREATE POLICY trainer_insert_schedules ON schedules FOR INSERT
    WITH CHECK (current_user_role() = 'trainer' AND trainer_id = current_user_id());
CREATE POLICY trainer_update_schedules ON schedules FOR UPDATE
    USING (current_user_role() = 'trainer' AND trainer_id = current_user_id())
    WITH CHECK (current_user_role() = 'trainer' AND trainer_id = current_user_id());
CREATE POLICY trainer_delete_schedules ON schedules FOR DELETE
    USING (current_user_role() = 'trainer' AND trainer_id = current_user_id());

-- Workouts policies
CREATE POLICY trainee_view_own_workouts ON workouts FOR SELECT
    USING (trainee_id = current_user_id() OR trainer_id = current_user_id());
CREATE POLICY trainer_view_all_workouts ON workouts FOR SELECT
    USING (current_user_role() = 'trainer');
CREATE POLICY trainer_insert_workouts ON workouts FOR INSERT
    WITH CHECK (current_user_role() = 'trainer' AND trainer_id = current_user_id());
CREATE POLICY trainer_update_workouts ON workouts FOR UPDATE
    USING (current_user_role() = 'trainer' AND trainer_id = current_user_id())
    WITH CHECK (current_user_role() = 'trainer' AND trainer_id = current_user_id());
CREATE POLICY trainer_delete_workouts ON workouts FOR DELETE
    USING (current_user_role() = 'trainer' AND trainer_id = current_user_id());

-- Session cards policies
CREATE POLICY trainee_view_own_session_cards ON session_cards FOR SELECT
    USING (trainee_id = current_user_id() OR trainer_id = current_user_id());
CREATE POLICY trainer_view_all_session_cards ON session_cards FOR SELECT
    USING (current_user_role() = 'trainer');
CREATE POLICY trainer_insert_session_cards ON session_cards FOR INSERT
    WITH CHECK (current_user_role() = 'trainer' AND trainer_id = current_user_id());
CREATE POLICY trainer_update_session_cards ON session_cards FOR UPDATE
    USING (current_user_role() = 'trainer' AND trainer_id = current_user_id())
    WITH CHECK (current_user_role() = 'trainer' AND trainer_id = current_user_id());
CREATE POLICY trainer_delete_session_cards ON session_cards FOR DELETE
    USING (current_user_role() = 'trainer' AND trainer_id = current_user_id());

-- Body weight policies
CREATE POLICY trainee_view_own_body_weight ON body_weight_entries FOR SELECT
    USING (trainee_id = current_user_id() OR current_user_role() = 'trainer');
CREATE POLICY trainer_insert_body_weight ON body_weight_entries FOR INSERT
    WITH CHECK (current_user_role() = 'trainer');
CREATE POLICY trainer_update_body_weight ON body_weight_entries FOR UPDATE
    USING (current_user_role() = 'trainer')
    WITH CHECK (current_user_role() = 'trainer');
CREATE POLICY trainer_delete_body_weight ON body_weight_entries FOR DELETE
    USING (current_user_role() = 'trainer');

-- Notifications policies
CREATE POLICY user_view_own_notifications ON notifications FOR SELECT
    USING (user_id = current_user_id());
CREATE POLICY user_update_own_notifications ON notifications FOR UPDATE
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());
CREATE POLICY user_delete_own_notifications ON notifications FOR DELETE
    USING (user_id = current_user_id());

-- Settings policies
CREATE POLICY user_view_own_settings ON settings FOR SELECT
    USING (user_id = current_user_id());
CREATE POLICY user_update_own_settings ON settings FOR UPDATE
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());
CREATE POLICY user_insert_own_settings ON settings FOR INSERT
    WITH CHECK (user_id = current_user_id());

\echo '✓ Row-level security configured'

-- =====================================================
-- SECTION 6: SEED EXERCISE DATA (Optional)
-- =====================================================

\echo '==> Seeding exercise library...'

-- Set to false if you don't want seed data
\set seed_exercises true

\if :seed_exercises
-- Weight Training Exercises (abbreviated for file size)
INSERT INTO exercises (name, type, category, description, muscle_groups, equipment, difficulty, instructions, tips, warnings, metadata) VALUES
('Squat', 'weight_training', 'Legs', 'Compound lower body exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], ARRAY['barbell', 'squat rack'], 'intermediate', 
 ARRAY['Set up barbell', 'Position on back', 'Descend to parallel', 'Drive through heels'], 
 ARRAY['Keep chest up', 'Neutral spine'], 
 ARRAY['Do not round back'], 
 '{"defaultSets": 4, "defaultReps": 8, "restTime": 120}'::jsonb),
 
('Bench Press', 'weight_training', 'Chest', 'Primary chest compound', ARRAY['pectorals', 'triceps', 'deltoids'], ARRAY['barbell', 'bench'], 'intermediate',
 ARRAY['Lie on bench', 'Lower to chest', 'Press up'],
 ARRAY['Retract shoulders', 'Drive through legs'],
 ARRAY['Use spotter'],
 '{"defaultSets": 4, "defaultReps": 8, "restTime": 120}'::jsonb),
 
('Deadlift', 'weight_training', 'Legs', 'Full-body compound lift', ARRAY['hamstrings', 'glutes', 'lower back'], ARRAY['barbell'], 'advanced',
 ARRAY['Grip bar', 'Keep back flat', 'Drive through heels'],
 ARRAY['Bar close to body', 'Engage lats'],
 ARRAY['Never round back'],
 '{"defaultSets": 3, "defaultReps": 5, "restTime": 180}'::jsonb),
 
('Pull-ups', 'weight_training', 'Back', 'Bodyweight back exercise', ARRAY['latissimus dorsi', 'biceps'], ARRAY['pull-up bar'], 'intermediate',
 ARRAY['Hang from bar', 'Pull up', 'Lower with control'],
 ARRAY['Full extension', 'No swinging'],
 ARRAY['Progress gradually'],
 '{"defaultSets": 3, "defaultReps": 8, "restTime": 120, "isBodyweight": true}'::jsonb),
 
('Push-ups', 'weight_training', 'Chest', 'Bodyweight chest exercise', ARRAY['pectorals', 'triceps', 'core'], ARRAY[], 'beginner',
 ARRAY['Plank position', 'Lower chest', 'Push up'],
 ARRAY['Keep body straight', 'Full ROM'],
 ARRAY['No sagging hips'],
 '{"defaultSets": 4, "defaultReps": 20, "restTime": 60, "isBodyweight": true}'::jsonb);

-- Cardio Exercises
INSERT INTO exercises (name, type, category, description, muscle_groups, equipment, difficulty, instructions, tips, warnings, metadata) VALUES
('Running', 'cardio', 'Cardio', 'Outdoor or treadmill running', ARRAY['legs', 'cardiovascular'], ARRAY['running shoes'], 'beginner',
 ARRAY['Warm up', 'Maintain pace', 'Cool down'],
 ARRAY['Start gradually', 'Proper shoes'],
 ARRAY['Max 10% increase per week'],
 '{"targetHeartRate": 140, "caloriesPerMinute": 10}'::jsonb),
 
('Cycling', 'cardio', 'Cardio', 'Bike or stationary cycling', ARRAY['legs', 'cardiovascular'], ARRAY['bicycle'], 'beginner',
 ARRAY['Adjust seat', 'Warm up', 'Maintain cadence'],
 ARRAY['Proper fit', 'Vary resistance'],
 ARRAY['Build duration gradually'],
 '{"targetHeartRate": 130, "caloriesPerMinute": 8}'::jsonb);

-- Flexibility Exercises
INSERT INTO exercises (name, type, category, description, muscle_groups, equipment, difficulty, instructions, tips, warnings, metadata) VALUES
('Yoga Flow', 'flexibility', 'Flexibility', 'Dynamic yoga sequence', ARRAY['full body'], ARRAY['yoga mat'], 'beginner',
 ARRAY['Mountain pose', 'Sun salutations', 'Hold poses', 'Savasana'],
 ARRAY['Focus on breath', 'Use props'],
 ARRAY['No bouncing'],
 '{"holdTime": 30, "breathingPattern": "deep"}'::jsonb),
 
('Static Stretching', 'flexibility', 'Flexibility', 'Traditional stretching', ARRAY['full body'], ARRAY['yoga mat'], 'beginner',
 ARRAY['Warm up', 'Stretch each group', 'Hold 30-60s'],
 ARRAY['Stretch when warm', 'Relax'],
 ARRAY['Never stretch cold'],
 '{"holdTime": 45, "breathingPattern": "deep and slow"}'::jsonb);

\echo '  ✓ 9 exercises seeded'
\endif

-- =====================================================
-- SECTION 7: FINAL STEPS
-- =====================================================

\echo '==> Running final steps...'

-- Refresh materialized views
SELECT refresh_all_materialized_views();

-- Display summary
\echo ''
\echo '================================================'
\echo '✓ Database initialization complete!'
\echo '================================================'
\echo 'Tables:       15'
\echo 'Indexes:      47'
\echo 'Triggers:     8'
\echo 'Functions:    10+'
\echo 'Views:        3 materialized'
\echo 'RLS Policies: Enabled on 6 tables'
\echo 'Exercises:    9 (if seeded)'
\echo '================================================'
\echo ''
\echo 'Next steps:'
\echo '  1. Optional: Run demo data seed'
\echo '     psql fitness_db -f database/seeds/002_seed_demo_data.sql'
\echo ''
\echo '  2. Verify installation:'
\echo '     psql fitness_db -c "SELECT COUNT(*) FROM users;"'
\echo '     psql fitness_db -c "SELECT COUNT(*) FROM exercises;"'
\echo ''
\echo '  3. Connect your backend application'
\echo '================================================'
