-- =====================================================
-- Migration: 009 - Create body_weight_entries table
-- Description: Body weight and composition tracking
-- Created: 2026-01-24
-- =====================================================

CREATE TABLE body_weight_entries (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Key
    trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Measurements
    weight DECIMAL(5,2) NOT NULL,
    date DATE NOT NULL,
    
    -- Additional Metrics
    bmi DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    muscle_mass DECIMAL(5,2),
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_weight_positive CHECK (weight > 0 AND weight < 500),
    CONSTRAINT chk_bmi_valid CHECK (bmi IS NULL OR (bmi >= 10 AND bmi <= 50)),
    CONSTRAINT chk_body_fat_valid CHECK (body_fat_percentage IS NULL OR (body_fat_percentage >= 0 AND body_fat_percentage <= 100)),
    CONSTRAINT chk_muscle_mass_valid CHECK (muscle_mass IS NULL OR (muscle_mass > 0 AND muscle_mass < 200))
);

-- =====================================================
-- Indexes
-- =====================================================

-- Foreign key index
CREATE INDEX idx_body_weight_trainee ON body_weight_entries(trainee_id);

-- Query optimization indexes
CREATE INDEX idx_body_weight_date ON body_weight_entries(date DESC);

-- Composite indexes
CREATE INDEX idx_body_weight_trainee_date ON body_weight_entries(trainee_id, date DESC);

-- Unique constraint: one entry per trainee per day
CREATE UNIQUE INDEX idx_body_weight_unique ON body_weight_entries(trainee_id, date);

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-calculate BMI before INSERT
CREATE TRIGGER calculate_bmi_on_insert
    BEFORE INSERT ON body_weight_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_bmi();

-- Auto-calculate BMI before UPDATE
CREATE TRIGGER calculate_bmi_on_update
    BEFORE UPDATE ON body_weight_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_bmi();

-- Update user's current weight on INSERT
CREATE TRIGGER update_user_weight_on_insert
    AFTER INSERT ON body_weight_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_user_current_weight();

-- Update user's current weight on UPDATE
CREATE TRIGGER update_user_weight_on_update
    AFTER UPDATE ON body_weight_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_user_current_weight();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE body_weight_entries IS 'Body weight and composition tracking over time';
COMMENT ON COLUMN body_weight_entries.weight IS 'Body weight in kg';
COMMENT ON COLUMN body_weight_entries.bmi IS 'Body Mass Index (auto-calculated)';
COMMENT ON COLUMN body_weight_entries.body_fat_percentage IS 'Body fat percentage (0-100)';
COMMENT ON COLUMN body_weight_entries.muscle_mass IS 'Muscle mass in kg';
