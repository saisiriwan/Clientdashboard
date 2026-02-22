-- =====================================================
-- Migration: 003 - Create users table
-- Description: Main users table for Trainers and Trainees
-- Created: 2026-01-24
-- =====================================================

CREATE TABLE users (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    
    -- Role & Permissions
    role VARCHAR(20) NOT NULL CHECK (role IN ('trainer', 'trainee')) DEFAULT 'trainee',
    
    -- Physical Stats (สำหรับ Trainee)
    height DECIMAL(5,2), -- cm
    weight DECIMAL(5,2), -- kg
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

-- Primary lookup indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Composite index for common queries
CREATE INDEX idx_users_role_active ON users(role, is_active);

-- Text search index for name
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at on UPDATE
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE users IS 'Main users table for both Trainers and Trainees';
COMMENT ON COLUMN users.id IS 'Primary key (UUID)';
COMMENT ON COLUMN users.email IS 'User email (unique, required)';
COMMENT ON COLUMN users.google_id IS 'Google OAuth ID (unique)';
COMMENT ON COLUMN users.role IS 'User role: trainer or trainee';
COMMENT ON COLUMN users.height IS 'User height in cm';
COMMENT ON COLUMN users.weight IS 'User current weight in kg';
COMMENT ON COLUMN users.is_active IS 'Account active status';
