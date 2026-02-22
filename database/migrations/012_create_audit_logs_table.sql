-- =====================================================
-- Migration: 012 - Create audit_logs table
-- Description: Audit trail for important operations
-- Created: 2026-01-24
-- =====================================================

CREATE TABLE audit_logs (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User Info
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    
    -- Action
    action VARCHAR(100) NOT NULL CHECK (
        action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW')
    ),
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    
    -- Details (JSONB)
    old_values JSONB,
    new_values JSONB,
    
    -- Request Info
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

-- User lookup
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- Action type
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Resource lookup
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Timestamp index for cleanup
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Composite indexes
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource_created ON audit_logs(resource_type, resource_id, created_at DESC);

-- JSONB indexes
CREATE INDEX idx_audit_logs_old_values ON audit_logs USING GIN (old_values);
CREATE INDEX idx_audit_logs_new_values ON audit_logs USING GIN (new_values);

-- =====================================================
-- Partitioning Strategy (Optional)
-- =====================================================

-- Comment: Consider partitioning by created_at for large datasets
-- Example: Monthly partitions for better query performance

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE audit_logs IS 'Audit trail for all important database operations';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (CREATE, UPDATE, DELETE, etc.)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Table name of affected resource';
COMMENT ON COLUMN audit_logs.old_values IS 'JSONB snapshot of data before change';
COMMENT ON COLUMN audit_logs.new_values IS 'JSONB snapshot of data after change';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of user who performed action';
