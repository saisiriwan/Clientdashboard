-- =====================================================
-- Migration: 004 - Create user_sessions table
-- Description: JWT refresh token management
-- Created: 2026-01-24
-- =====================================================

CREATE TABLE user_sessions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Key
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tokens
    refresh_token VARCHAR(500) NOT NULL UNIQUE,
    access_token VARCHAR(500) NOT NULL,
    
    -- Session Info
    ip_address INET,
    user_agent TEXT,
    
    -- Expiration
    expires_at TIMESTAMP NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_refresh ON user_sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- Composite index for cleanup queries
CREATE INDEX idx_sessions_expires_created ON user_sessions(expires_at, created_at);

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-cleanup expired sessions on INSERT
CREATE TRIGGER cleanup_expired_sessions
    AFTER INSERT ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_expired_sessions_function();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE user_sessions IS 'User authentication sessions and refresh tokens';
COMMENT ON COLUMN user_sessions.refresh_token IS 'JWT refresh token (unique, 7 days expiry)';
COMMENT ON COLUMN user_sessions.access_token IS 'JWT access token (15 minutes expiry)';
COMMENT ON COLUMN user_sessions.expires_at IS 'Session expiration timestamp';
