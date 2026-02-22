-- =====================================================
-- Migration: 010 - Create notifications table
-- Description: User notifications system
-- Created: 2026-01-24
-- =====================================================

CREATE TABLE notifications (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Key
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Info
    type VARCHAR(50) NOT NULL CHECK (
        type IN (
            'schedule_created',
            'schedule_updated',
            'schedule_reminder',
            'workout_logged',
            'session_card_created',
            'achievement_unlocked',
            'body_weight_logged',
            'program_assigned'
        )
    ),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related Resource
    resource_type VARCHAR(50),
    resource_id UUID,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

-- Foreign key index
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Query optimization indexes
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Resource lookup index
CREATE INDEX idx_notifications_resource ON notifications(resource_type, resource_id);

-- Partial index for unread notifications
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE is_read = false;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE notifications IS 'User notifications for various system events';
COMMENT ON COLUMN notifications.type IS 'Notification type (schedule_created, workout_logged, etc.)';
COMMENT ON COLUMN notifications.resource_type IS 'Type of related resource (schedules, workouts, etc.)';
COMMENT ON COLUMN notifications.resource_id IS 'ID of related resource';
COMMENT ON COLUMN notifications.is_read IS 'Whether notification has been read';
