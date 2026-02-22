-- =====================================================
-- Migration: 011 - Create settings table
-- Description: User preferences and settings
-- Created: 2026-01-24
-- =====================================================

CREATE TABLE settings (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Key
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Theme & UI
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) DEFAULT 'th',
    
    -- Notifications (JSONB)
    notification_settings JSONB DEFAULT '{"email":true,"push":true,"sms":false}'::jsonb,
    
    -- Privacy (JSONB)
    privacy_settings JSONB DEFAULT '{"profileVisibility":"private","showStats":false}'::jsonb,
    
    -- Units
    weight_unit VARCHAR(10) DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
    distance_unit VARCHAR(10) DEFAULT 'km' CHECK (distance_unit IN ('km', 'miles')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

-- Unique index on user_id
CREATE UNIQUE INDEX idx_settings_user ON settings(user_id);

-- JSONB indexes
CREATE INDEX idx_settings_notification ON settings USING GIN (notification_settings);
CREATE INDEX idx_settings_privacy ON settings USING GIN (privacy_settings);

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE settings IS 'User preferences and application settings';
COMMENT ON COLUMN settings.theme IS 'UI theme: light, dark, or auto';
COMMENT ON COLUMN settings.notification_settings IS 'JSONB notification preferences';
COMMENT ON COLUMN settings.privacy_settings IS 'JSONB privacy preferences';
COMMENT ON COLUMN settings.weight_unit IS 'Preferred weight unit: kg or lbs';
COMMENT ON COLUMN settings.distance_unit IS 'Preferred distance unit: km or miles';

COMMENT ON COLUMN settings.notification_settings IS 'Example:
{
  "email": true,
  "push": true,
  "sms": false,
  "types": {
    "schedule_created": true,
    "schedule_updated": true,
    "schedule_reminder": true,
    "workout_logged": true,
    "session_card_created": true,
    "achievement_unlocked": true
  }
}';

COMMENT ON COLUMN settings.privacy_settings IS 'Example:
{
  "profileVisibility": "private",
  "showStats": false,
  "allowMessages": true
}';
