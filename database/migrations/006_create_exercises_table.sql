-- =====================================================
-- Migration: 006 - Create exercises table
-- Description: Master exercise library
-- Created: 2026-01-24
-- =====================================================

CREATE TABLE exercises (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Info
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (
        type IN ('weight_training', 'cardio', 'flexibility')
    ),
    category VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Metadata (JSONB)
    metadata JSONB,
    
    -- Arrays
    muscle_groups TEXT[],
    equipment TEXT[],
    instructions TEXT[],
    tips TEXT[],
    warnings TEXT[],
    
    -- Difficulty
    difficulty VARCHAR(20) CHECK (
        difficulty IN ('beginner', 'intermediate', 'advanced')
    ),
    
    -- Media
    video_url TEXT,
    thumbnail_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    
    -- Created By
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

-- Unique constraint on name
CREATE UNIQUE INDEX idx_exercises_name_unique ON exercises(LOWER(name));

-- Basic indexes
CREATE INDEX idx_exercises_type ON exercises(type);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_active ON exercises(is_active);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_usage ON exercises(usage_count DESC);

-- Composite indexes
CREATE INDEX idx_exercises_type_active ON exercises(type, is_active);
CREATE INDEX idx_exercises_category_type ON exercises(category, type);

-- GIN indexes for array fields
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN (muscle_groups);
CREATE INDEX idx_exercises_equipment ON exercises USING GIN (equipment);

-- JSONB index
CREATE INDEX idx_exercises_metadata ON exercises USING GIN (metadata);

-- Text search index
CREATE INDEX idx_exercises_name_trgm ON exercises USING gin (name gin_trgm_ops);
CREATE INDEX idx_exercises_description_trgm ON exercises USING gin (description gin_trgm_ops);

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE exercises IS 'Master exercise library with all exercise definitions';
COMMENT ON COLUMN exercises.type IS 'Exercise type: weight_training, cardio, or flexibility';
COMMENT ON COLUMN exercises.metadata IS 'JSONB metadata specific to exercise type';
COMMENT ON COLUMN exercises.muscle_groups IS 'Array of target muscle groups';
COMMENT ON COLUMN exercises.equipment IS 'Array of required equipment';
COMMENT ON COLUMN exercises.usage_count IS 'Number of times exercise has been used in workouts';
