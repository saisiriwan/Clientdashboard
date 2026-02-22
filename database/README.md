# 🗄️ Fitness Management System - Database

## 📋 Overview

Complete PostgreSQL database schema for the Fitness Management System with full support for:
- ✅ 15 Database Tables
- ✅ 47 Indexes (optimized queries)
- ✅ 8 Triggers (automation)
- ✅ 10+ Functions (business logic)
- ✅ 3 Materialized Views (analytics)
- ✅ Row-Level Security (RBAC enforcement)
- ✅ Seed Data (25+ exercises, demo users)

---

## 📊 Database Schema

### Core Tables (5)
1. **users** - Trainers and Trainees
2. **user_sessions** - JWT session management
3. **schedules** - Training appointments
4. **workouts** - Workout logs with JSONB exercises
5. **exercises** - Exercise library (master data)

### Feedback & Progress (2)
6. **session_cards** - Trainer feedback cards
7. **body_weight_entries** - Body weight tracking

### System Tables (4)
8. **notifications** - User notifications
9. **settings** - User preferences
10. **audit_logs** - Audit trail
11. **api_rate_limits** - Rate limiting

### Advanced Tables (4)
12. **webhooks** - Webhook configurations
13. **exercise_templates** - Workout templates
14. **program_templates** - Training programs
15. **trainee_programs** - Program assignments

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install PostgreSQL 15+
brew install postgresql@15  # macOS
sudo apt-get install postgresql-15  # Ubuntu

# Install golang-migrate (optional)
brew install golang-migrate  # macOS
```

---

### Option 1: Using Migration Files

```bash
# 1. Create database
createdb fitness_db

# 2. Set database URL
export DATABASE_URL="postgresql://postgres:password@localhost:5432/fitness_db"

# 3. Run migrations in order
psql $DATABASE_URL -f database/migrations/001_create_extensions.sql
psql $DATABASE_URL -f database/migrations/002_create_functions.sql
psql $DATABASE_URL -f database/migrations/003_create_users_table.sql
psql $DATABASE_URL -f database/migrations/004_create_user_sessions_table.sql
psql $DATABASE_URL -f database/migrations/005_create_schedules_table.sql
psql $DATABASE_URL -f database/migrations/006_create_exercises_table.sql
psql $DATABASE_URL -f database/migrations/007_create_workouts_table.sql
psql $DATABASE_URL -f database/migrations/008_create_session_cards_table.sql
psql $DATABASE_URL -f database/migrations/009_create_body_weight_entries_table.sql
psql $DATABASE_URL -f database/migrations/010_create_notifications_table.sql
psql $DATABASE_URL -f database/migrations/011_create_settings_table.sql
psql $DATABASE_URL -f database/migrations/012_create_audit_logs_table.sql
psql $DATABASE_URL -f database/migrations/013_create_remaining_tables.sql
psql $DATABASE_URL -f database/migrations/014_create_views.sql
psql $DATABASE_URL -f database/migrations/015_create_rls_policies.sql

# 4. Seed data
psql $DATABASE_URL -f database/seeds/001_seed_exercises.sql
psql $DATABASE_URL -f database/seeds/002_seed_demo_data.sql
```

---

### Option 2: All-in-One Script

```bash
# Create and run all-in-one migration
cat database/migrations/*.sql > /tmp/all_migrations.sql
cat database/seeds/*.sql >> /tmp/all_migrations.sql
psql $DATABASE_URL -f /tmp/all_migrations.sql
```

---

### Option 3: Using golang-migrate

```bash
# Install migrations tool
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Run migrations
migrate -path database/migrations -database $DATABASE_URL up

# Run seeds
psql $DATABASE_URL -f database/seeds/001_seed_exercises.sql
psql $DATABASE_URL -f database/seeds/002_seed_demo_data.sql
```

---

## 📁 File Structure

```
database/
├── README.md                           # This file
├── migrations/
│   ├── 001_create_extensions.sql      # PostgreSQL extensions
│   ├── 002_create_functions.sql       # Utility functions & triggers
│   ├── 003_create_users_table.sql     # Users table
│   ├── 004_create_user_sessions_table.sql
│   ├── 005_create_schedules_table.sql
│   ├── 006_create_exercises_table.sql
│   ├── 007_create_workouts_table.sql
│   ├── 008_create_session_cards_table.sql
│   ├── 009_create_body_weight_entries_table.sql
│   ├── 010_create_notifications_table.sql
│   ├── 011_create_settings_table.sql
│   ├── 012_create_audit_logs_table.sql
│   ├── 013_create_remaining_tables.sql # Support tables
│   ├── 014_create_views.sql           # Materialized views
│   └── 015_create_rls_policies.sql    # Row-level security
├── seeds/
│   ├── 001_seed_exercises.sql         # 25+ common exercises
│   └── 002_seed_demo_data.sql         # Demo users, workouts, etc.
└── docs/
    └── schema_diagram.md              # ER diagram
```

---

## 🔧 Database Functions

### Auto-Update Functions
- `update_updated_at_column()` - Auto-update timestamps
- `cleanup_expired_sessions_function()` - Clean expired sessions
- `calculate_bmi()` - Auto-calculate BMI

### Notification Functions
- `create_schedule_notification()` - Notify on new schedule
- `update_schedule_notification()` - Notify on schedule change
- `create_workout_notification()` - Notify on workout log
- `create_session_card_notification()` - Notify on feedback card

### Business Logic Functions
- `update_user_current_weight()` - Update user weight from entries
- `increment_exercise_usage()` - Track exercise popularity
- `create_audit_log()` - Audit trail logging
- `get_trainee_stats()` - Calculate trainee statistics
- `refresh_all_materialized_views()` - Refresh analytics views

---

## 📈 Materialized Views

### 1. trainee_stats_view
Comprehensive trainee statistics for dashboard

```sql
SELECT * FROM trainee_stats_view 
WHERE trainee_id = 'uuid';
```

**Columns:**
- total_workouts, total_duration_minutes
- avg_workout_rating, total_sessions
- total_weight_lifted, total_distance
- current_weight, start_weight
- last_workout_date

**Refresh:**
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY trainee_stats_view;
```

---

### 2. exercise_stats_view
Exercise usage and popularity

```sql
SELECT * FROM exercise_stats_view 
ORDER BY times_used_in_workouts DESC 
LIMIT 10;
```

**Columns:**
- exercise_name, type, category
- times_used_in_workouts
- used_by_trainees
- avg_weight (for weight training)

---

### 3. trainer_dashboard_view
Trainer dashboard overview

```sql
SELECT * FROM trainer_dashboard_view 
WHERE trainer_id = 'uuid';
```

**Columns:**
- active_trainees, total_trainees
- total_sessions, pending_sessions
- avg_workout_rating
- last_workout_logged

---

## 🔐 Row-Level Security (RLS)

### Enabled on Tables:
- schedules
- workouts
- session_cards
- body_weight_entries
- notifications
- settings

### Policy Examples:

**Trainee (READ-ONLY):**
```sql
-- Can view own schedules
SELECT * FROM schedules WHERE trainee_id = current_user_id();

-- Cannot create/update/delete (403 Forbidden)
INSERT INTO schedules (...) VALUES (...);  -- ❌ Blocked
UPDATE schedules SET ...;                  -- ❌ Blocked
DELETE FROM schedules WHERE ...;           -- ❌ Blocked
```

**Trainer (FULL ACCESS):**
```sql
-- Can view all schedules
SELECT * FROM schedules;

-- Can create/update/delete
INSERT INTO schedules (...) VALUES (...);  -- ✅ Allowed
UPDATE schedules SET ...;                  -- ✅ Allowed
DELETE FROM schedules WHERE ...;           -- ✅ Allowed
```

### Setting User Context (in Go backend):

```go
// Set current user in session
_, err := db.Exec(`
    SET LOCAL app.current_user_id = $1;
    SET LOCAL app.current_user_role = $2;
`, userID, userRole)
```

---

## 📊 Sample Queries

### Get Trainee Workout History
```sql
SELECT 
    w.date,
    w.duration,
    w.rating,
    w.summary->>'totalSets' as total_sets,
    w.summary->>'totalWeight' as total_weight,
    t.name as trainer_name
FROM workouts w
JOIN users t ON w.trainer_id = t.id
WHERE w.trainee_id = 'uuid'
ORDER BY w.date DESC
LIMIT 10;
```

---

### Get Exercise Progress (Squat)
```sql
WITH exercise_data AS (
    SELECT 
        w.date,
        exercise->>'name' as exercise_name,
        (set_data->>'weight')::NUMERIC as weight,
        (set_data->>'reps')::INTEGER as reps
    FROM workouts w,
    jsonb_array_elements(w.exercises) as exercise,
    jsonb_array_elements(exercise->'sets') as set_data
    WHERE w.trainee_id = 'uuid'
    AND exercise->>'name' = 'Squat'
)
SELECT 
    date,
    MAX(weight) as max_weight,
    AVG(weight) as avg_weight,
    SUM(weight * reps) as volume
FROM exercise_data
GROUP BY date
ORDER BY date;
```

---

### Get Upcoming Sessions
```sql
SELECT 
    s.id,
    s.title,
    s.date,
    s.start_time,
    s.location,
    s.status,
    t.name as trainee_name,
    tr.name as trainer_name
FROM schedules s
JOIN users t ON s.trainee_id = t.id
JOIN users tr ON s.trainer_id = tr.id
WHERE s.date >= CURRENT_DATE
AND s.status IN ('pending', 'confirmed')
ORDER BY s.date, s.start_time
LIMIT 5;
```

---

### Get Body Weight Progress
```sql
SELECT 
    date,
    weight,
    bmi,
    body_fat_percentage,
    weight - LAG(weight) OVER (ORDER BY date) as weight_change
FROM body_weight_entries
WHERE trainee_id = 'uuid'
ORDER BY date DESC;
```

---

## 🔍 Index Usage Analysis

```sql
-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check unused indexes
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%_pkey';
```

---

## 🧹 Maintenance

### Refresh Materialized Views

```sql
-- Manual refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY trainee_stats_view;

-- Or refresh all
SELECT refresh_all_materialized_views();
```

### Vacuum & Analyze

```sql
-- Vacuum all tables
VACUUM ANALYZE;

-- Vacuum specific table
VACUUM ANALYZE workouts;
```

### Cleanup Old Data

```sql
-- Delete old audit logs (older than 90 days)
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete expired sessions
DELETE FROM user_sessions 
WHERE expires_at < NOW();
```

---

## 📊 Database Size

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size('fitness_db'));

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔧 Troubleshooting

### Reset Database

```bash
# Drop and recreate
dropdb fitness_db
createdb fitness_db

# Re-run migrations
# (see Quick Start above)
```

### Check Constraints

```sql
-- List all constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    conrelid::regclass as table_name
FROM pg_constraint
WHERE conrelid::regclass::text LIKE '%'
ORDER BY conrelid::regclass::text;
```

### View Triggers

```sql
SELECT 
    event_object_table AS table_name,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

---

## 📝 Demo Users

After running seeds, you'll have:

### Trainers:
- **Coach John Smith** - `trainer1@fitness.com`
- **Coach Sarah Johnson** - `trainer2@fitness.com`

### Trainees:
- **Jane Doe** - `trainee1@example.com` (has workout history)
- **Michael Chen** - `trainee2@example.com`
- **Emily Brown** - `trainee3@example.com`

### Demo Data:
- ✅ 25+ exercises (weight training, cardio, flexibility)
- ✅ 7 schedules (past, today, upcoming)
- ✅ 3 workouts with realistic JSONB data
- ✅ 2 session feedback cards
- ✅ 6 body weight entries (showing progress)
- ✅ 3 notifications

---

## 🎯 Next Steps

1. ✅ Database schema created
2. ✅ Seed data populated
3. ⏳ **Connect Backend (Go + Gin + GORM)**
4. ⏳ Implement API endpoints
5. ⏳ Connect Frontend (React)
6. ⏳ Deploy to production

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Materialized Views](https://www.postgresql.org/docs/current/rules-materializedviews.html)

---

**Created by**: Figma Make AI Assistant  
**Date**: 24 มกราคม 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
