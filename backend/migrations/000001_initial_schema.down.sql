-- ==========================================
-- Rollback Initial Schema
-- ==========================================

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_update_trainee_stats ON session_cards;
DROP TRIGGER IF EXISTS session_cards_updated_at ON session_cards;
DROP TRIGGER IF EXISTS schedules_updated_at ON schedules;
DROP TRIGGER IF EXISTS program_assignments_updated_at ON program_assignments;
DROP TRIGGER IF EXISTS programs_updated_at ON programs;
DROP TRIGGER IF EXISTS locations_updated_at ON locations;
DROP TRIGGER IF EXISTS trainees_updated_at ON trainees;
DROP TRIGGER IF EXISTS trainers_updated_at ON trainers;
DROP TRIGGER IF EXISTS users_updated_at ON users;

-- Drop functions
DROP FUNCTION IF EXISTS update_trainee_stats();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse order (to respect foreign keys)
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS exercise_sets CASCADE;
DROP TABLE IF EXISTS session_exercises CASCADE;
DROP TABLE IF EXISTS exercise_library CASCADE;
DROP TABLE IF EXISTS session_cards CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS program_assignments CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS trainees CASCADE;
DROP TABLE IF EXISTS trainers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop extensions
DROP EXTENSION IF EXISTS "uuid-ossp";
