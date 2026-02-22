-- =====================================================
-- Migration: 008 - Create session_cards table
-- Description: Trainer feedback and session summaries
-- Created: 2026-01-24
-- =====================================================

CREATE TABLE session_cards (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
    
    -- Session Info
    date DATE NOT NULL,
    summary TEXT NOT NULL,
    
    -- Feedback Arrays
    achievements TEXT[],
    areas_for_improvement TEXT[],
    next_session_goals TEXT[],
    
    -- Trainer Notes
    trainer_notes TEXT,
    
    -- Rating
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Tags
    tags TEXT[],
    
    -- Media (JSONB)
    media JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================

-- Foreign key indexes
CREATE INDEX idx_session_cards_trainee ON session_cards(trainee_id);
CREATE INDEX idx_session_cards_trainer ON session_cards(trainer_id);
CREATE INDEX idx_session_cards_workout ON session_cards(workout_id);

-- Query optimization indexes
CREATE INDEX idx_session_cards_date ON session_cards(date DESC);
CREATE INDEX idx_session_cards_rating ON session_cards(rating);

-- Composite indexes
CREATE INDEX idx_session_cards_trainee_date ON session_cards(trainee_id, date DESC);
CREATE INDEX idx_session_cards_trainer_date ON session_cards(trainer_id, date DESC);

-- GIN indexes for arrays
CREATE INDEX idx_session_cards_tags ON session_cards USING GIN (tags);
CREATE INDEX idx_session_cards_achievements ON session_cards USING GIN (achievements);

-- JSONB index for media
CREATE INDEX idx_session_cards_media ON session_cards USING GIN (media);

-- Full-text search on summary
CREATE INDEX idx_session_cards_summary_trgm ON session_cards USING gin (summary gin_trgm_ops);

-- =====================================================
-- Triggers
-- =====================================================

-- Auto-update updated_at
CREATE TRIGGER update_session_cards_updated_at
    BEFORE UPDATE ON session_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create notification on INSERT
CREATE TRIGGER notify_session_card_created
    AFTER INSERT ON session_cards
    FOR EACH ROW
    EXECUTE FUNCTION create_session_card_notification();

-- Create audit log
CREATE TRIGGER audit_session_cards
    AFTER INSERT OR UPDATE OR DELETE ON session_cards
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE session_cards IS 'Trainer feedback cards with achievements and goals';
COMMENT ON COLUMN session_cards.achievements IS 'Array of trainee achievements in this session';
COMMENT ON COLUMN session_cards.areas_for_improvement IS 'Array of areas to work on';
COMMENT ON COLUMN session_cards.next_session_goals IS 'Array of goals for next session';
COMMENT ON COLUMN session_cards.media IS 'JSONB with images and videos URLs';

COMMENT ON COLUMN session_cards.media IS 'Example:
{
  "images": ["https://storage.example.com/sessions/abc123.jpg"],
  "videos": ["https://storage.example.com/sessions/def456.mp4"]
}';
