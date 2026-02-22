-- =====================================================
-- Migration: 002 - Create Database Functions
-- Description: Utility functions for triggers and calculations
-- Created: 2026-01-24
-- =====================================================

-- =====================================================
-- Function: update_updated_at_column()
-- Purpose: Auto-update updated_at timestamp on UPDATE
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically update updated_at column on row update';

-- =====================================================
-- Function: cleanup_expired_sessions_function()
-- Purpose: Auto-cleanup expired user sessions
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_sessions_function()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete expired sessions older than 1 day
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions_function() IS 'Cleanup expired sessions on new session insert';

-- =====================================================
-- Function: create_schedule_notification()
-- Purpose: Create notification when schedule is created
-- =====================================================
CREATE OR REPLACE FUNCTION create_schedule_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (
        user_id, 
        type, 
        title, 
        message, 
        resource_type, 
        resource_id
    )
    VALUES (
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

COMMENT ON FUNCTION create_schedule_notification() IS 'Create notification when new schedule is created';

-- =====================================================
-- Function: update_schedule_notification()
-- Purpose: Create notification when schedule is updated
-- =====================================================
CREATE OR REPLACE FUNCTION update_schedule_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify if date, time, or status changed
    IF (OLD.date != NEW.date OR 
        OLD.start_time != NEW.start_time OR 
        OLD.status != NEW.status) THEN
        
        INSERT INTO notifications (
            user_id, 
            type, 
            title, 
            message, 
            resource_type, 
            resource_id
        )
        VALUES (
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

COMMENT ON FUNCTION update_schedule_notification() IS 'Create notification when schedule is updated';

-- =====================================================
-- Function: create_workout_notification()
-- Purpose: Create notification when workout is logged
-- =====================================================
CREATE OR REPLACE FUNCTION create_workout_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (
        user_id, 
        type, 
        title, 
        message, 
        resource_type, 
        resource_id
    )
    VALUES (
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

COMMENT ON FUNCTION create_workout_notification() IS 'Create notification when workout is logged';

-- =====================================================
-- Function: create_session_card_notification()
-- Purpose: Create notification when session card is created
-- =====================================================
CREATE OR REPLACE FUNCTION create_session_card_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (
        user_id, 
        type, 
        title, 
        message, 
        resource_type, 
        resource_id
    )
    VALUES (
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

COMMENT ON FUNCTION create_session_card_notification() IS 'Create notification when session card is created';

-- =====================================================
-- Function: update_user_current_weight()
-- Purpose: Update user's current weight when new entry added
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_current_weight()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET 
        weight = NEW.weight,
        updated_at = NOW()
    WHERE id = NEW.trainee_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_user_current_weight() IS 'Update user current weight from body_weight_entries';

-- =====================================================
-- Function: calculate_bmi()
-- Purpose: Auto-calculate BMI from weight and height
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
DECLARE
    user_height DECIMAL(5,2);
BEGIN
    -- Get user height
    SELECT height INTO user_height
    FROM users
    WHERE id = NEW.trainee_id;
    
    -- Calculate BMI if height exists
    IF user_height IS NOT NULL AND user_height > 0 THEN
        NEW.bmi = ROUND((NEW.weight / ((user_height / 100) * (user_height / 100)))::NUMERIC, 2);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_bmi() IS 'Auto-calculate BMI from weight and height';

-- =====================================================
-- Function: increment_exercise_usage()
-- Purpose: Increment exercise usage count when used in workout
-- =====================================================
CREATE OR REPLACE FUNCTION increment_exercise_usage()
RETURNS TRIGGER AS $$
DECLARE
    exercise_record RECORD;
    exercise_name TEXT;
BEGIN
    -- Loop through exercises in JSONB array
    FOR exercise_record IN 
        SELECT value->>'name' as name
        FROM jsonb_array_elements(NEW.exercises)
    LOOP
        exercise_name := exercise_record.name;
        
        -- Increment usage count
        UPDATE exercises
        SET usage_count = usage_count + 1
        WHERE name = exercise_name;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_exercise_usage() IS 'Increment exercise usage count from workouts';

-- =====================================================
-- Function: create_audit_log()
-- Purpose: Create audit log entry for important actions
-- =====================================================
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    user_email_var VARCHAR(255);
BEGIN
    -- Get user email
    IF TG_OP = 'DELETE' THEN
        SELECT email INTO user_email_var FROM users WHERE id = OLD.trainer_id;
    ELSE
        SELECT email INTO user_email_var FROM users WHERE id = NEW.trainer_id;
    END IF;
    
    -- Insert audit log
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            user_id,
            user_email,
            action,
            resource_type,
            resource_id,
            new_values
        ) VALUES (
            NEW.trainer_id,
            user_email_var,
            'CREATE',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (
            user_id,
            user_email,
            action,
            resource_type,
            resource_id,
            old_values,
            new_values
        ) VALUES (
            NEW.trainer_id,
            user_email_var,
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            user_id,
            user_email,
            action,
            resource_type,
            resource_id,
            old_values
        ) VALUES (
            OLD.trainer_id,
            user_email_var,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_audit_log() IS 'Create audit log for important database operations';

-- =====================================================
-- Function: get_trainee_stats()
-- Purpose: Calculate trainee statistics
-- =====================================================
CREATE OR REPLACE FUNCTION get_trainee_stats(trainee_uuid UUID)
RETURNS TABLE (
    total_workouts BIGINT,
    total_sessions BIGINT,
    avg_rating NUMERIC,
    total_duration INTEGER,
    weight_lifted NUMERIC,
    distance_run NUMERIC,
    current_streak INTEGER,
    longest_streak INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT w.id) as total_workouts,
        COUNT(DISTINCT s.id) as total_sessions,
        ROUND(AVG(w.rating)::NUMERIC, 2) as avg_rating,
        COALESCE(SUM(w.duration), 0)::INTEGER as total_duration,
        COALESCE(SUM((w.summary->>'totalWeight')::NUMERIC), 0) as weight_lifted,
        COALESCE(SUM((w.summary->>'totalDistance')::NUMERIC), 0) as distance_run,
        0 as current_streak, -- TODO: implement streak calculation
        0 as longest_streak  -- TODO: implement streak calculation
    FROM users u
    LEFT JOIN workouts w ON u.id = w.trainee_id
    LEFT JOIN schedules s ON u.id = s.trainee_id
    WHERE u.id = trainee_uuid
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_trainee_stats(UUID) IS 'Calculate comprehensive trainee statistics';
