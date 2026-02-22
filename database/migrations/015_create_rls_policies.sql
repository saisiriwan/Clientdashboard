-- =====================================================
-- Migration: 015 - Row-Level Security Policies
-- Description: Enforce RBAC at database level
-- Created: 2026-01-24
-- =====================================================

-- =====================================================
-- Helper Functions for RLS
-- =====================================================

-- Function to get current user ID from session
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS VARCHAR AS $$
BEGIN
    RETURN current_setting('app.current_user_role', true)::VARCHAR;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION current_user_id() IS 'Get current user ID from session config';
COMMENT ON FUNCTION current_user_role() IS 'Get current user role from session config';

-- =====================================================
-- Enable RLS on Tables
-- =====================================================

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SCHEDULES Policies
-- =====================================================

-- Trainee can view own schedules
CREATE POLICY trainee_view_own_schedules ON schedules
    FOR SELECT
    USING (
        trainee_id = current_user_id() OR
        trainer_id = current_user_id()
    );

-- Trainer can view all schedules
CREATE POLICY trainer_view_all_schedules ON schedules
    FOR SELECT
    USING (
        current_user_role() = 'trainer'
    );

-- Only trainer can INSERT schedules
CREATE POLICY trainer_insert_schedules ON schedules
    FOR INSERT
    WITH CHECK (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    );

-- Only trainer can UPDATE schedules
CREATE POLICY trainer_update_schedules ON schedules
    FOR UPDATE
    USING (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    )
    WITH CHECK (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    );

-- Only trainer can DELETE schedules
CREATE POLICY trainer_delete_schedules ON schedules
    FOR DELETE
    USING (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    );

-- =====================================================
-- WORKOUTS Policies
-- =====================================================

-- Trainee can view own workouts
CREATE POLICY trainee_view_own_workouts ON workouts
    FOR SELECT
    USING (
        trainee_id = current_user_id() OR
        trainer_id = current_user_id()
    );

-- Trainer can view all workouts
CREATE POLICY trainer_view_all_workouts ON workouts
    FOR SELECT
    USING (
        current_user_role() = 'trainer'
    );

-- Only trainer can INSERT workouts
CREATE POLICY trainer_insert_workouts ON workouts
    FOR INSERT
    WITH CHECK (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    );

-- Only trainer can UPDATE workouts
CREATE POLICY trainer_update_workouts ON workouts
    FOR UPDATE
    USING (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    )
    WITH CHECK (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    );

-- Only trainer can DELETE workouts
CREATE POLICY trainer_delete_workouts ON workouts
    FOR DELETE
    USING (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    );

-- =====================================================
-- SESSION_CARDS Policies
-- =====================================================

-- Trainee can view own session cards
CREATE POLICY trainee_view_own_session_cards ON session_cards
    FOR SELECT
    USING (
        trainee_id = current_user_id() OR
        trainer_id = current_user_id()
    );

-- Trainer can view all session cards
CREATE POLICY trainer_view_all_session_cards ON session_cards
    FOR SELECT
    USING (
        current_user_role() = 'trainer'
    );

-- Only trainer can INSERT session cards
CREATE POLICY trainer_insert_session_cards ON session_cards
    FOR INSERT
    WITH CHECK (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    );

-- Only trainer can UPDATE session cards
CREATE POLICY trainer_update_session_cards ON session_cards
    FOR UPDATE
    USING (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    )
    WITH CHECK (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    );

-- Only trainer can DELETE session cards
CREATE POLICY trainer_delete_session_cards ON session_cards
    FOR DELETE
    USING (
        current_user_role() = 'trainer' AND
        trainer_id = current_user_id()
    );

-- =====================================================
-- BODY_WEIGHT_ENTRIES Policies
-- =====================================================

-- Trainee can view own body weight entries
CREATE POLICY trainee_view_own_body_weight ON body_weight_entries
    FOR SELECT
    USING (
        trainee_id = current_user_id() OR
        current_user_role() = 'trainer'
    );

-- Only trainer can INSERT body weight entries
CREATE POLICY trainer_insert_body_weight ON body_weight_entries
    FOR INSERT
    WITH CHECK (
        current_user_role() = 'trainer'
    );

-- Only trainer can UPDATE body weight entries
CREATE POLICY trainer_update_body_weight ON body_weight_entries
    FOR UPDATE
    USING (
        current_user_role() = 'trainer'
    )
    WITH CHECK (
        current_user_role() = 'trainer'
    );

-- Only trainer can DELETE body weight entries
CREATE POLICY trainer_delete_body_weight ON body_weight_entries
    FOR DELETE
    USING (
        current_user_role() = 'trainer'
    );

-- =====================================================
-- NOTIFICATIONS Policies
-- =====================================================

-- Users can only view their own notifications
CREATE POLICY user_view_own_notifications ON notifications
    FOR SELECT
    USING (
        user_id = current_user_id()
    );

-- Users can only update their own notifications (mark as read)
CREATE POLICY user_update_own_notifications ON notifications
    FOR UPDATE
    USING (
        user_id = current_user_id()
    )
    WITH CHECK (
        user_id = current_user_id()
    );

-- Users can only delete their own notifications
CREATE POLICY user_delete_own_notifications ON notifications
    FOR DELETE
    USING (
        user_id = current_user_id()
    );

-- =====================================================
-- SETTINGS Policies
-- =====================================================

-- Users can only view their own settings
CREATE POLICY user_view_own_settings ON settings
    FOR SELECT
    USING (
        user_id = current_user_id()
    );

-- Users can only update their own settings
CREATE POLICY user_update_own_settings ON settings
    FOR UPDATE
    USING (
        user_id = current_user_id()
    )
    WITH CHECK (
        user_id = current_user_id()
    );

-- Users can insert their own settings
CREATE POLICY user_insert_own_settings ON settings
    FOR INSERT
    WITH CHECK (
        user_id = current_user_id()
    );

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON POLICY trainee_view_own_schedules ON schedules IS 'Trainee can only view schedules where they are the trainee or trainer';
COMMENT ON POLICY trainer_view_all_schedules ON schedules IS 'Trainer can view all schedules';
COMMENT ON POLICY trainer_insert_schedules ON schedules IS 'Only trainer can create schedules';

COMMENT ON POLICY trainee_view_own_workouts ON workouts IS 'Trainee can only view their own workouts';
COMMENT ON POLICY trainer_view_all_workouts ON workouts IS 'Trainer can view all workouts';
COMMENT ON POLICY trainer_insert_workouts ON workouts IS 'Only trainer can log workouts';

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Note: Actual grants depend on your application user setup
-- Example for application role:

-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT INSERT, UPDATE, DELETE ON schedules TO app_user;
-- GRANT INSERT, UPDATE, DELETE ON workouts TO app_user;
-- etc.
