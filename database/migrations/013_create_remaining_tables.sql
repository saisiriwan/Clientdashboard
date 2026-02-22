-- =====================================================
-- Migration: 013 - Create remaining support tables
-- Description: API rate limits, webhooks, templates, programs
-- Created: 2026-01-24
-- =====================================================

-- =====================================================
-- TABLE: api_rate_limits
-- =====================================================

CREATE TABLE api_rate_limits (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identifier
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    
    -- Endpoint
    endpoint VARCHAR(255) NOT NULL,
    
    -- Rate Limit
    requests_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rate_limits_user ON api_rate_limits(user_id, window_start);
CREATE INDEX idx_rate_limits_ip ON api_rate_limits(ip_address, window_start);
CREATE INDEX idx_rate_limits_endpoint ON api_rate_limits(endpoint, window_start);

COMMENT ON TABLE api_rate_limits IS 'API rate limiting tracking';

-- =====================================================
-- TABLE: webhooks
-- =====================================================

CREATE TABLE webhooks (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Key
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Webhook Info
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(255) NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhooks_user ON webhooks(user_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
CREATE INDEX idx_webhooks_events ON webhooks USING GIN (events);

-- Triggers
CREATE TRIGGER update_webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE webhooks IS 'Webhook configurations for external integrations';

-- =====================================================
-- TABLE: exercise_templates
-- =====================================================

CREATE TABLE exercise_templates (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Key
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Template Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    exercises JSONB NOT NULL,
    
    -- Metadata
    tags TEXT[],
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_minutes INTEGER,
    
    -- Status
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exercise_templates_creator ON exercise_templates(created_by);
CREATE INDEX idx_exercise_templates_public ON exercise_templates(is_public);
CREATE INDEX idx_exercise_templates_usage ON exercise_templates(usage_count DESC);
CREATE INDEX idx_exercise_templates_difficulty ON exercise_templates(difficulty);
CREATE INDEX idx_exercise_templates_tags ON exercise_templates USING GIN (tags);
CREATE INDEX idx_exercise_templates_exercises ON exercise_templates USING GIN (exercises);

-- Triggers
CREATE TRIGGER update_exercise_templates_updated_at
    BEFORE UPDATE ON exercise_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE exercise_templates IS 'Pre-made workout templates for trainers';

-- =====================================================
-- TABLE: program_templates
-- =====================================================

CREATE TABLE program_templates (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Key
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Program Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_weeks INTEGER NOT NULL,
    
    -- Weekly Plan (JSONB)
    weekly_plan JSONB NOT NULL,
    
    -- Metadata
    goals TEXT[],
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    
    -- Status
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_duration_positive CHECK (duration_weeks > 0 AND duration_weeks <= 52)
);

-- Indexes
CREATE INDEX idx_program_templates_creator ON program_templates(created_by);
CREATE INDEX idx_program_templates_public ON program_templates(is_public);
CREATE INDEX idx_program_templates_usage ON program_templates(usage_count DESC);
CREATE INDEX idx_program_templates_difficulty ON program_templates(difficulty);
CREATE INDEX idx_program_templates_goals ON program_templates USING GIN (goals);
CREATE INDEX idx_program_templates_weekly_plan ON program_templates USING GIN (weekly_plan);

-- Triggers
CREATE TRIGGER update_program_templates_updated_at
    BEFORE UPDATE ON program_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE program_templates IS 'Complete training program templates (multi-week programs)';

-- =====================================================
-- TABLE: trainee_programs
-- =====================================================

CREATE TABLE trainee_programs (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES program_templates(id) ON DELETE SET NULL,
    
    -- Progress
    current_week INTEGER DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'paused', 'completed', 'cancelled')
    ),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_current_week_positive CHECK (current_week > 0),
    CONSTRAINT chk_end_after_start CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_trainee_programs_trainee ON trainee_programs(trainee_id);
CREATE INDEX idx_trainee_programs_trainer ON trainee_programs(trainer_id);
CREATE INDEX idx_trainee_programs_program ON trainee_programs(program_id);
CREATE INDEX idx_trainee_programs_status ON trainee_programs(status);
CREATE INDEX idx_trainee_programs_trainee_status ON trainee_programs(trainee_id, status);

-- Triggers
CREATE TRIGGER update_trainee_programs_updated_at
    BEFORE UPDATE ON trainee_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE trainee_programs IS 'Program assignments to trainees with progress tracking';
