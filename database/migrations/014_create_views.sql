-- =====================================================
-- Migration: 014 - Create Database Views
-- Description: Materialized views for analytics and reporting
-- Created: 2026-01-24
-- =====================================================

-- =====================================================
-- VIEW: trainee_stats_view
-- Purpose: Comprehensive trainee statistics
-- =====================================================

CREATE MATERIALIZED VIEW trainee_stats_view AS
SELECT 
    t.id as trainee_id,
    t.name as trainee_name,
    t.email,
    t.avatar,
    
    -- Workout stats
    COUNT(DISTINCT w.id) as total_workouts,
    COALESCE(SUM(w.duration), 0) as total_duration_minutes,
    COALESCE(AVG(w.rating), 0) as avg_workout_rating,
    
    -- Schedule stats
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'cancelled' THEN s.id END) as cancelled_sessions,
    
    -- Session card stats
    COUNT(DISTINCT sc.id) as total_session_cards,
    COALESCE(AVG(sc.rating), 0) as avg_session_rating,
    
    -- Weight training stats
    COALESCE(SUM((w.summary->>'totalWeight')::NUMERIC), 0) as total_weight_lifted,
    COALESCE(SUM((w.summary->>'totalReps')::NUMERIC), 0) as total_reps,
    COALESCE(SUM((w.summary->>'totalSets')::NUMERIC), 0) as total_sets,
    
    -- Cardio stats
    COALESCE(SUM((w.summary->>'totalDistance')::NUMERIC), 0) as total_distance,
    COALESCE(SUM((w.summary->>'totalCalories')::NUMERIC), 0) as total_calories,
    
    -- Body weight stats
    (SELECT weight FROM body_weight_entries WHERE trainee_id = t.id ORDER BY date DESC LIMIT 1) as current_weight,
    (SELECT weight FROM body_weight_entries WHERE trainee_id = t.id ORDER BY date ASC LIMIT 1) as start_weight,
    
    -- Recent activity
    MAX(w.date) as last_workout_date,
    MAX(s.date) as last_schedule_date,
    
    -- Timestamps
    t.created_at,
    NOW() as stats_updated_at

FROM users t
LEFT JOIN workouts w ON t.id = w.trainee_id
LEFT JOIN schedules s ON t.id = s.trainee_id
LEFT JOIN session_cards sc ON t.id = sc.trainee_id
WHERE t.role = 'trainee'
GROUP BY t.id, t.name, t.email, t.avatar, t.created_at;

-- Create indexes on materialized view
CREATE UNIQUE INDEX idx_trainee_stats_trainee_id ON trainee_stats_view(trainee_id);
CREATE INDEX idx_trainee_stats_total_workouts ON trainee_stats_view(total_workouts DESC);
CREATE INDEX idx_trainee_stats_avg_rating ON trainee_stats_view(avg_workout_rating DESC);
CREATE INDEX idx_trainee_stats_last_workout ON trainee_stats_view(last_workout_date DESC);

COMMENT ON MATERIALIZED VIEW trainee_stats_view IS 'Comprehensive trainee statistics for analytics';

-- =====================================================
-- VIEW: exercise_stats_view
-- Purpose: Exercise usage and popularity statistics
-- =====================================================

CREATE MATERIALIZED VIEW exercise_stats_view AS
SELECT 
    e.id as exercise_id,
    e.name as exercise_name,
    e.type,
    e.category,
    e.difficulty,
    e.usage_count,
    
    -- Usage in workouts (from JSONB)
    COUNT(DISTINCT w.id) as times_used_in_workouts,
    COUNT(DISTINCT w.trainee_id) as used_by_trainees,
    
    -- Average performance (for weight training)
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
    
    -- Recent activity
    MAX(w.date) as last_used_date,
    
    -- Timestamps
    e.created_at,
    NOW() as stats_updated_at

FROM exercises e
LEFT JOIN workouts w ON w.exercises @> jsonb_build_array(jsonb_build_object('name', e.name))
GROUP BY e.id, e.name, e.type, e.category, e.difficulty, e.usage_count, e.created_at;

-- Create indexes on materialized view
CREATE UNIQUE INDEX idx_exercise_stats_exercise_id ON exercise_stats_view(exercise_id);
CREATE INDEX idx_exercise_stats_type ON exercise_stats_view(type);
CREATE INDEX idx_exercise_stats_times_used ON exercise_stats_view(times_used_in_workouts DESC);
CREATE INDEX idx_exercise_stats_used_by ON exercise_stats_view(used_by_trainees DESC);

COMMENT ON MATERIALIZED VIEW exercise_stats_view IS 'Exercise usage and popularity statistics';

-- =====================================================
-- VIEW: trainer_dashboard_view
-- Purpose: Trainer dashboard overview
-- =====================================================

CREATE MATERIALIZED VIEW trainer_dashboard_view AS
SELECT 
    tr.id as trainer_id,
    tr.name as trainer_name,
    tr.email,
    
    -- Trainee stats
    COUNT(DISTINCT CASE WHEN u.role = 'trainee' AND u.is_active = true THEN u.id END) as active_trainees,
    COUNT(DISTINCT CASE WHEN u.role = 'trainee' THEN u.id END) as total_trainees,
    
    -- Schedule stats
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'pending' THEN s.id END) as pending_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'confirmed' THEN s.id END) as confirmed_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
    COUNT(DISTINCT CASE WHEN s.date >= CURRENT_DATE THEN s.id END) as upcoming_sessions,
    
    -- Workout stats
    COUNT(DISTINCT w.id) as total_workouts_logged,
    COALESCE(AVG(w.rating), 0) as avg_workout_rating,
    
    -- Session card stats
    COUNT(DISTINCT sc.id) as total_session_cards,
    COALESCE(AVG(sc.rating), 0) as avg_session_rating,
    
    -- Recent activity
    MAX(w.created_at) as last_workout_logged,
    MAX(s.created_at) as last_schedule_created,
    
    -- Timestamps
    tr.created_at,
    NOW() as stats_updated_at

FROM users tr
LEFT JOIN schedules s ON tr.id = s.trainer_id
LEFT JOIN workouts w ON tr.id = w.trainer_id
LEFT JOIN session_cards sc ON tr.id = sc.trainer_id
LEFT JOIN (
    SELECT DISTINCT trainer_id, trainee_id
    FROM schedules
    UNION
    SELECT DISTINCT trainer_id, trainee_id
    FROM workouts
) trainer_trainee_rel ON tr.id = trainer_trainee_rel.trainer_id
LEFT JOIN users u ON trainer_trainee_rel.trainee_id = u.id
WHERE tr.role = 'trainer'
GROUP BY tr.id, tr.name, tr.email, tr.created_at;

-- Create indexes on materialized view
CREATE UNIQUE INDEX idx_trainer_dashboard_trainer_id ON trainer_dashboard_view(trainer_id);
CREATE INDEX idx_trainer_dashboard_active_trainees ON trainer_dashboard_view(active_trainees DESC);
CREATE INDEX idx_trainer_dashboard_total_sessions ON trainer_dashboard_view(total_sessions DESC);

COMMENT ON MATERIALIZED VIEW trainer_dashboard_view IS 'Trainer dashboard statistics and overview';

-- =====================================================
-- VIEW: workout_summary_view (Regular View)
-- Purpose: Simplified workout view with calculated fields
-- =====================================================

CREATE OR REPLACE VIEW workout_summary_view AS
SELECT 
    w.id,
    w.trainee_id,
    w.trainer_id,
    t.name as trainee_name,
    tr.name as trainer_name,
    w.date,
    w.duration,
    w.rating,
    w.mood,
    
    -- Summary stats
    (w.summary->>'totalSets')::INTEGER as total_sets,
    (w.summary->>'totalReps')::INTEGER as total_reps,
    (w.summary->>'totalWeight')::NUMERIC as total_weight,
    (w.summary->>'totalDistance')::NUMERIC as total_distance,
    (w.summary->>'exerciseCount')::INTEGER as exercise_count,
    
    -- Type breakdown
    (w.summary->'typeBreakdown'->>'weight_training')::INTEGER as weight_training_count,
    (w.summary->'typeBreakdown'->>'cardio')::INTEGER as cardio_count,
    (w.summary->'typeBreakdown'->>'flexibility')::INTEGER as flexibility_count,
    
    w.created_at,
    w.updated_at

FROM workouts w
JOIN users t ON w.trainee_id = t.id
JOIN users tr ON w.trainer_id = tr.id;

COMMENT ON VIEW workout_summary_view IS 'Simplified workout view with denormalized summary data';

-- =====================================================
-- Refresh Functions
-- =====================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY trainee_stats_view;
    REFRESH MATERIALIZED VIEW CONCURRENTLY exercise_stats_view;
    REFRESH MATERIALIZED VIEW CONCURRENTLY trainer_dashboard_view;
    
    RAISE NOTICE 'All materialized views refreshed successfully';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_all_materialized_views() IS 'Refresh all materialized views concurrently';

-- =====================================================
-- Initial Refresh
-- =====================================================

-- Refresh all views on creation
SELECT refresh_all_materialized_views();
