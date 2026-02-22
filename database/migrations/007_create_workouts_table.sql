-- =====================================================
-- Migration: 007 - Create workouts table
-- Description: Workout session logs with exercises
-- Created: 2026-01-24
-- =====================================================

CREATE TABLE workouts (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
    
    -- Workout Info
    date DATE NOT NULL,
    duration INTEGER NOT NULL, -- minutes
    
    -- Exercises (JSONB Array)
    exercises JSONB NOT NULL,
    
    -- Summary Stats (Auto-calculated JSONB)
    summary JSONB NOT NULL,
    
    -- Notes & Feedback
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    mood VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_duration_positive CHECK (duration > 0),
    CONSTRAINT chk_exercises_not_empty CHECK (jsonb_array_length(exercises) > 0)
);

-- =====================================================
-- Indexes
-- =====================================================

-- Foreign key indexes
CREATE INDEX idx_workouts_trainee ON workouts(trainee_id);
CREATE INDEX idx_workouts_trainer ON workouts(trainer_id);
CREATE INDEX idx_workouts_schedule ON workouts(schedule_id);

-- Query optimization indexes
CREATE INDEX idx_workouts_date ON workouts(date DESC);
CREATE INDEX idx_workouts_rating ON workouts(rating);

-- Composite indexes for common queries
CREATE INDEX idx_workouts_trainee_date ON workouts(trainee_id, date DESC);
CREATE INDEX idx_workouts_trainer_date ON workouts(trainer_id, date DESC);

-- GIN indexes for JSONB queries
CREATE INDEX idx_workouts_exercises ON workouts USING GIN (exercises);
CREATE INDEX idx_workouts_summary ON workouts USING GIN (summary);

-- JSONB path indexes for specific queries
CREATE INDEX idx_workouts_exercise_names ON workouts USING GIN ((exercises -> 'name'));

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create notification on INSERT
CREATE TRIGGER notify_workout_created
    AFTER INSERT ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION create_workout_notification();

-- Increment exercise usage count
CREATE TRIGGER increment_exercise_usage_on_workout
    AFTER INSERT ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION increment_exercise_usage();

-- Create audit log
CREATE TRIGGER audit_workouts
    AFTER INSERT OR UPDATE OR DELETE ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE workouts IS 'Workout session logs with exercise details in JSONB format';
COMMENT ON COLUMN workouts.exercises IS 'JSONB array of exercises with sets and reps';
COMMENT ON COLUMN workouts.summary IS 'Auto-calculated summary statistics (totalSets, totalReps, etc.)';
COMMENT ON COLUMN workouts.duration IS 'Workout duration in minutes';
COMMENT ON COLUMN workouts.rating IS 'Workout rating from 1-5';

-- =====================================================
-- Example JSONB Structure
-- =====================================================

COMMENT ON COLUMN workouts.exercises IS 'Example:
[
  {
    "name": "Squat",
    "type": "weight_training",
    "isBodyweight": false,
    "sets": [
      {"setNumber": 1, "weight": 100, "reps": 8, "rest": 90}
    ]
  },
  {
    "name": "Running",
    "type": "cardio",
    "sets": [
      {"setNumber": 1, "distance": 5.2, "duration": 27.5, "pace": 5.29, "calories": 416}
    ]
  }
]';

COMMENT ON COLUMN workouts.summary IS 'Example:
{
  "totalSets": 10,
  "totalReps": 80,
  "totalWeight": 2000,
  "totalDistance": 5.2,
  "totalDuration": 57.5,
  "exerciseCount": 3,
  "typeBreakdown": {
    "weight_training": 2,
    "cardio": 1,
    "flexibility": 0
  }
}';
