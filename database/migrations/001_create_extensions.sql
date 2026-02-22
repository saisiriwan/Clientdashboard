-- =====================================================
-- Migration: 001 - Create PostgreSQL Extensions
-- Description: Enable required PostgreSQL extensions
-- Created: 2026-01-24
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Comment
COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions';
COMMENT ON EXTENSION "pg_trgm" IS 'Text similarity measurement and index searching';
COMMENT ON EXTENSION "pgcrypto" IS 'Cryptographic functions';
