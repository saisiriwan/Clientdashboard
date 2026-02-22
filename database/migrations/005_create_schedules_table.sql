-- =====================================================
-- Migration: 005 - Create schedules table
-- Description: Training session schedules
-- Created: 2026-01-24
-- =====================================================

CREATE TABLE schedules (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Schedule Info
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- minutes
    
    -- Location
    location VARCHAR(255),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'completed', 'cancelled')
    ),
    
    -- Notes
    notes TEXT,
    
    -- Reminder
    reminder_sent BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_end_after_start CHECK (end_time > start_time),
    CONSTRAINT chk_date_not_past CHECK (date >= CURRENT_DATE OR status IN ('completed', 'cancelled'))
);

-- =====================================================
-- Indexes
-- =====================================================

-- Foreign key indexes
CREATE INDEX idx_schedules_trainee ON schedules(trainee_id);
CREATE INDEX idx_schedules_trainer ON schedules(trainer_id);

-- Query optimization indexes
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_datetime ON schedules(date, start_time);

-- Composite indexes for common queries
CREATE INDEX idx_schedules_trainee_date_status ON schedules(trainee_id, date, status);
CREATE INDEX idx_schedules_trainer_date_status ON schedules(trainer_id, date, status);
CREATE INDEX idx_schedules_date_status ON schedules(date DESC, status);

-- Reminder index
CREATE INDEX idx_schedules_reminder ON schedules(date, reminder_sent) WHERE reminder_sent = false;

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create notification on INSERT
CREATE TRIGGER notify_schedule_created
    AFTER INSERT ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION create_schedule_notification();

-- Create notification on UPDATE
CREATE TRIGGER notify_schedule_updated
    AFTER UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_schedule_notification();

-- Create audit log
CREATE TRIGGER audit_schedules
    AFTER INSERT OR UPDATE OR DELETE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE schedules IS 'Training session schedules between trainers and trainees';
COMMENT ON COLUMN schedules.duration IS 'Session duration in minutes';
COMMENT ON COLUMN schedules.status IS 'Schedule status: pending, confirmed, completed, cancelled';
COMMENT ON COLUMN schedules.reminder_sent IS 'Whether reminder notification has been sent';
