# 🗄️ Database Design Specification
## Fitness Training Management System

**Database:** PostgreSQL 15+  
**ORM:** GORM (Go)  
**Version:** 2.0  
**Date:** 2026-01-11

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Tables Design](#tables-design)
4. [Indexes & Performance](#indexes--performance)
5. [Database Migrations](#database-migrations)
6. [Sample Data](#sample-data)
7. [Queries Examples](#queries-examples)

---

## 🎯 Overview

### **Database Statistics:**
- **Total Tables:** 15
- **Total Relationships:** 18
- **Estimated Storage:** ~1GB per 10,000 users

### **Design Principles:**
- ✅ **Normalization:** 3NF (Third Normal Form)
- ✅ **Soft Deletes:** All tables have `deleted_at`
- ✅ **Timestamps:** All tables have `created_at`, `updated_at`
- ✅ **UUIDs:** For distributed systems (optional)
- ✅ **Indexes:** Optimized for common queries
- ✅ **Constraints:** Foreign keys with CASCADE rules
- ✅ **JSON Fields:** For flexible data structures

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐
│   users     │◄─────────┐
└─────────────┘          │
      △                  │
      │                  │
      ├──────────────────┼────────────────┐
      │                  │                │
┌─────┴──────┐    ┌──────┴──────┐  ┌─────┴──────┐
│  trainers  │    │  trainees   │  │notifications│
└────────────┘    └─────────────┘  └────────────┘
      │                  │
      │                  │
      │           ┌──────┴──────────────┐
      │           │                     │
      │    ┌──────┴──────┐       ┌─────┴─────┐
      │    │  programs   │       │  metrics  │
      │    └─────────────┘       └───────────┘
      │           │
      │           │
      │    ┌──────┴──────────────┐
      │    │ program_assignments │
      │    └─────────────────────┘
      │
      │
┌─────┴──────────────┐
│    schedules       │
└────────────────────┘
      │
      │
┌─────┴──────────────┐
│  session_cards     │
└────────────────────┘
      │
      │
┌─────┴──────────────┐
│ session_exercises  │
└────────────────────┘
      │
      │
┌─────┴──────────────┐
│  exercise_sets     │
└────────────────────┘

┌─────────────┐
│  locations  │
└─────────────┘

┌──────────────────┐
│ exercise_library │
└──────────────────┘
```

---

## 📋 Tables Design

### **1. users** - ตารางผู้ใช้หลัก (Authentication)

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('trainer', 'trainee', 'admin')),
    profile_image TEXT,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    
    -- OAuth fields
    oauth_provider VARCHAR(50), -- 'google', 'facebook', null
    oauth_id VARCHAR(255),
    oauth_access_token TEXT,
    oauth_refresh_token TEXT,
    oauth_token_expiry TIMESTAMP,
    
    -- Security
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_oauth (oauth_provider, oauth_id)
);

COMMENT ON TABLE users IS 'ตารางผู้ใช้หลัก รองรับ Email/Password และ Google OAuth';
COMMENT ON COLUMN users.role IS 'บทบาท: trainer, trainee, admin';
COMMENT ON COLUMN users.oauth_provider IS 'OAuth provider: google, facebook, หรือ null สำหรับ email/password';
```

---

### **2. trainers** - ข้อมูลเทรนเนอร์

```sql
CREATE TABLE trainers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    
    -- Professional Info
    bio TEXT,
    specialization TEXT[], -- Array: ['Strength', 'Bodybuilding', 'Weight Loss']
    certifications TEXT[], -- Array: ['NASM-CPT', 'ACE', 'ISSA']
    experience_years INTEGER DEFAULT 0,
    
    -- Stats
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_ratings INTEGER DEFAULT 0,
    total_clients INTEGER DEFAULT 0,
    
    -- Availability
    availability VARCHAR(20) DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
    working_hours JSONB, -- {"monday": "09:00-18:00", "tuesday": "09:00-18:00"}
    
    -- Social Media
    instagram_url VARCHAR(255),
    facebook_url VARCHAR(255),
    youtube_url VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_trainers_user_id (user_id),
    INDEX idx_trainers_rating (rating),
    INDEX idx_trainers_availability (availability)
);

COMMENT ON TABLE trainers IS 'ข้อมูลเทรนเนอร์';
COMMENT ON COLUMN trainers.specialization IS 'ความเชี่ยวชาญ (Array)';
COMMENT ON COLUMN trainers.working_hours IS 'เวลาทำงาน (JSON)';
```

---

### **3. trainees** - ข้อมูลลูกค้า (Trainee)

```sql
CREATE TABLE trainees (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    trainer_id BIGINT, -- Assigned trainer
    
    -- Physical Info
    height DECIMAL(5,2), -- cm
    weight DECIMAL(5,2), -- kg
    
    -- Goals
    goals TEXT[], -- ['เพิ่มกล้ามเนื้อ 5kg', 'ลดไขมัน 3%']
    fitness_level VARCHAR(20) CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    
    -- Medical Info
    medical_notes TEXT,
    injuries TEXT[],
    allergies TEXT[],
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Membership
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    membership_type VARCHAR(50), -- 'monthly', 'quarterly', 'yearly'
    membership_expiry DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    
    -- Stats (Cache for performance)
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    cancelled_sessions INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_workout_hours DECIMAL(10,2) DEFAULT 0.00,
    last_session_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_trainees_user_id (user_id),
    INDEX idx_trainees_trainer_id (trainer_id),
    INDEX idx_trainees_status (status)
);

COMMENT ON TABLE trainees IS 'ข้อมูลลูกค้า (Trainee)';
COMMENT ON COLUMN trainees.trainer_id IS 'เทรนเนอร์ที่ assigned (nullable)';
COMMENT ON COLUMN trainees.status IS 'สถานะ: active, inactive, suspended';
```

---

### **4. locations** - สถานที่ฝึก

```sql
CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    floor VARCHAR(10),
    building VARCHAR(255),
    
    -- Contact
    phone_number VARCHAR(20),
    email VARCHAR(255),
    
    -- Map
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    map_url TEXT,
    
    -- Operating Hours
    opening_hours VARCHAR(50), -- "06:00-22:00"
    operating_days TEXT[], -- ['monday', 'tuesday', 'wednesday']
    
    -- Facilities
    facilities TEXT[], -- ['Cardio Zone', 'Free Weights', 'Locker Room']
    images TEXT[], -- Array of image URLs
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_locations_name (name),
    INDEX idx_locations_is_active (is_active)
);

COMMENT ON TABLE locations IS 'สถานที่ฝึก/สาขา';
```

---

### **5. programs** - โปรแกรมการฝึก (Template)

```sql
CREATE TABLE programs (
    id BIGSERIAL PRIMARY KEY,
    trainer_id BIGINT NOT NULL,
    
    -- Program Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Duration
    total_weeks INTEGER NOT NULL,
    sessions_per_week INTEGER NOT NULL,
    
    -- Goals
    goals TEXT[], -- ['เพิ่มกล้ามเนื้อ', 'ลดไขมัน']
    target_fitness_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    
    -- Schedule
    weekly_schedule JSONB, -- [{"day": "Monday", "focus": "Upper Body", "duration": 60}]
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    
    -- Stats
    total_assignments INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_programs_trainer_id (trainer_id),
    INDEX idx_programs_status (status),
    INDEX idx_programs_name (name)
);

COMMENT ON TABLE programs IS 'โปรแกรมการฝึก (Template ที่สร้างโดย Trainer)';
COMMENT ON COLUMN programs.status IS 'สถานะ: draft, active, archived';
```

---

### **6. program_assignments** - การมอบหมายโปรแกรม

```sql
CREATE TABLE program_assignments (
    id BIGSERIAL PRIMARY KEY,
    program_id BIGINT NOT NULL,
    trainee_id BIGINT NOT NULL,
    
    -- Timeline
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_week INTEGER DEFAULT 1,
    
    -- Progress
    progress_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    sessions_completed INTEGER DEFAULT 0,
    total_sessions INTEGER NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    
    -- Notes
    notes TEXT,
    progress_notes JSONB, -- [{"week": 1, "date": "2026-01-01", "note": "...", "recordedBy": "..."}]
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (trainee_id) REFERENCES trainees(id) ON DELETE CASCADE,
    
    -- Constraints
    UNIQUE (trainee_id, status) WHERE status = 'active', -- Only one active program per trainee
    
    -- Indexes
    INDEX idx_program_assignments_program_id (program_id),
    INDEX idx_program_assignments_trainee_id (trainee_id),
    INDEX idx_program_assignments_status (status),
    INDEX idx_program_assignments_active (trainee_id, status) WHERE status = 'active'
);

COMMENT ON TABLE program_assignments IS 'การมอบหมายโปรแกรมให้ลูกค้า';
COMMENT ON COLUMN program_assignments.status IS 'สถานะ: active, completed, paused, cancelled';
COMMENT ON COLUMN program_assignments.progress_notes IS 'บันทึกความก้าวหน้าแต่ละสัปดาห์ (JSON)';
```

---

### **7. schedules** - ตารางนัดหมาย

```sql
CREATE TABLE schedules (
    id BIGSERIAL PRIMARY KEY,
    trainer_id BIGINT NOT NULL,
    trainee_id BIGINT NOT NULL,
    location_id BIGINT,
    program_assignment_id BIGINT,
    
    -- Schedule Info
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER NOT NULL, -- minutes
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Session Type
    session_type VARCHAR(50), -- 'Strength Training', 'Cardio', 'HIIT', etc.
    planned_exercises TEXT[], -- ['Squat', 'Deadlift', 'Bench Press']
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    
    -- Notes
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    cancelled_by BIGINT, -- user_id
    
    -- Related
    session_card_id BIGINT, -- Link to session_cards after completion
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    FOREIGN KEY (trainee_id) REFERENCES trainees(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (program_assignment_id) REFERENCES program_assignments(id) ON DELETE SET NULL,
    FOREIGN KEY (session_card_id) REFERENCES session_cards(id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_schedules_trainer_id (trainer_id),
    INDEX idx_schedules_trainee_id (trainee_id),
    INDEX idx_schedules_date (date),
    INDEX idx_schedules_status (status),
    INDEX idx_schedules_trainer_date (trainer_id, date),
    INDEX idx_schedules_trainee_date (trainee_id, date),
    INDEX idx_schedules_upcoming (trainee_id, date, status) WHERE status IN ('scheduled', 'confirmed')
);

COMMENT ON TABLE schedules IS 'ตารางนัดหมายการฝึก';
COMMENT ON COLUMN schedules.status IS 'สถานะ: scheduled, confirmed, completed, cancelled, no_show';
COMMENT ON COLUMN schedules.session_card_id IS 'Link ไปยัง session_cards หลังจบเซสชั่น';
```

---

### **8. session_cards** - การ์ดสรุปผลการฝึก

```sql
CREATE TABLE session_cards (
    id BIGSERIAL PRIMARY KEY,
    schedule_id BIGINT NOT NULL UNIQUE,
    trainer_id BIGINT NOT NULL,
    trainee_id BIGINT NOT NULL,
    
    -- Session Info
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL, -- minutes (actual duration)
    
    -- Feedback
    overall_feedback TEXT,
    next_session_goals TEXT[], -- ['เพิ่มน้ำหนัก Squat', 'ฝึก Core']
    
    -- Rating
    trainer_rating INTEGER CHECK (trainer_rating >= 1 AND trainer_rating <= 5),
    trainee_rating INTEGER CHECK (trainee_rating >= 1 AND trainee_rating <= 5),
    
    -- Stats
    total_exercises INTEGER DEFAULT 0,
    total_sets INTEGER DEFAULT 0,
    total_volume DECIMAL(10,2) DEFAULT 0.00, -- kg (weight x reps x sets)
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE,
    FOREIGN KEY (trainee_id) REFERENCES trainees(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_session_cards_schedule_id (schedule_id),
    INDEX idx_session_cards_trainer_id (trainer_id),
    INDEX idx_session_cards_trainee_id (trainee_id),
    INDEX idx_session_cards_date (date),
    INDEX idx_session_cards_trainee_date (trainee_id, date DESC)
);

COMMENT ON TABLE session_cards IS 'การ์ดสรุปผลการฝึก (บันทึกหลังจบเซสชั่น)';
COMMENT ON COLUMN session_cards.total_volume IS 'ปริมาณรวม (weight x reps x sets) ทั้งเซสชั่น';
```

---

### **9. session_exercises** - ท่าออกกำลังกายในแต่ละเซสชั่น

```sql
CREATE TABLE session_exercises (
    id BIGSERIAL PRIMARY KEY,
    session_card_id BIGINT NOT NULL,
    exercise_library_id BIGINT, -- Reference to exercise library (optional)
    
    -- Exercise Info
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- 'Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Cardio'
    
    -- Order
    exercise_order INTEGER NOT NULL, -- 1, 2, 3, ... (order in session)
    
    -- Notes
    notes TEXT,
    form_notes TEXT,
    
    -- Stats (Calculated from sets)
    total_sets INTEGER DEFAULT 0,
    total_reps INTEGER DEFAULT 0,
    total_weight DECIMAL(10,2) DEFAULT 0.00,
    total_volume DECIMAL(10,2) DEFAULT 0.00, -- weight x reps x sets
    
    -- Personal Records
    is_pr BOOLEAN DEFAULT FALSE, -- Personal Record flag
    pr_note TEXT,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (session_card_id) REFERENCES session_cards(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_library_id) REFERENCES exercise_library(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_session_exercises_session_card_id (session_card_id),
    INDEX idx_session_exercises_exercise_library_id (exercise_library_id),
    INDEX idx_session_exercises_category (category),
    INDEX idx_session_exercises_name (name)
);

COMMENT ON TABLE session_exercises IS 'ท่าออกกำลังกายในแต่ละเซสชั่น';
COMMENT ON COLUMN session_exercises.exercise_order IS 'ลำดับท่าในเซสชั่น';
COMMENT ON COLUMN session_exercises.is_pr IS 'Personal Record (สถิติส่วนตัว)';
```

---

### **10. exercise_sets** - เซตของแต่ละท่า

```sql
CREATE TABLE exercise_sets (
    id BIGSERIAL PRIMARY KEY,
    session_exercise_id BIGINT NOT NULL,
    
    -- Set Info
    set_number INTEGER NOT NULL,
    
    -- Weight Training
    reps INTEGER,
    weight DECIMAL(6,2), -- kg
    
    -- Cardio/Endurance
    duration INTEGER, -- seconds
    distance DECIMAL(6,2), -- km
    
    -- Rest
    rest_duration INTEGER, -- seconds
    
    -- Completion
    completed BOOLEAN DEFAULT TRUE,
    
    -- RPE (Rate of Perceived Exertion)
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (session_exercise_id) REFERENCES session_exercises(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_exercise_sets_session_exercise_id (session_exercise_id)
);

COMMENT ON TABLE exercise_sets IS 'เซตของแต่ละท่าออกกำลังกาย';
COMMENT ON COLUMN exercise_sets.rpe IS 'Rate of Perceived Exertion (1-10)';
COMMENT ON COLUMN exercise_sets.weight IS 'น้ำหนัก (kg) สำหรับ Weight Training';
COMMENT ON COLUMN exercise_sets.duration IS 'ระยะเวลา (วินาที) สำหรับ Cardio';
```

---

### **11. exercise_library** - คลังท่าออกกำลังกาย

```sql
CREATE TABLE exercise_library (
    id BIGSERIAL PRIMARY KEY,
    trainer_id BIGINT, -- NULL = public exercises
    
    -- Exercise Info
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Legs', 'Chest', 'Back', etc.
    description TEXT,
    
    -- Muscle Groups
    muscle_groups TEXT[], -- ['Quadriceps', 'Glutes', 'Hamstrings']
    
    -- Equipment
    equipment TEXT[], -- ['Barbell', 'Dumbbells', 'Machine']
    
    -- Difficulty
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    
    -- Instructions
    instructions TEXT[], -- Step-by-step instructions
    
    -- Media
    video_url TEXT,
    thumbnail_url TEXT,
    images TEXT[],
    
    -- Status
    is_public BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE, -- Verified by admin
    
    -- Stats
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_exercise_library_name (name),
    INDEX idx_exercise_library_category (category),
    INDEX idx_exercise_library_difficulty (difficulty),
    INDEX idx_exercise_library_trainer_id (trainer_id),
    INDEX idx_exercise_library_is_public (is_public)
);

COMMENT ON TABLE exercise_library IS 'คลังท่าออกกำลังกาย (สาธารณะ + ส่วนตัว)';
COMMENT ON COLUMN exercise_library.trainer_id IS 'NULL = ท่าสาธารณะ, มีค่า = ท่าที่ Trainer สร้างเอง';
COMMENT ON COLUMN exercise_library.is_verified IS 'ตรวจสอบโดย Admin แล้ว';
```

---

### **12. metrics** - ข้อมูลการวัดผล

```sql
CREATE TABLE metrics (
    id BIGSERIAL PRIMARY KEY,
    trainee_id BIGINT NOT NULL,
    
    -- Measurement
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('weight', 'body_fat', 'muscle_mass', 'measurement')),
    value DECIMAL(8,2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'kg', '%', 'cm'
    
    -- Body Measurements (for type = 'measurement')
    measurement_type VARCHAR(50), -- 'chest', 'waist', 'arms', 'thighs', etc.
    
    -- Notes
    notes TEXT,
    
    -- Recorded By
    recorded_by BIGINT, -- user_id (trainer or trainee)
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (trainee_id) REFERENCES trainees(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_metrics_trainee_id (trainee_id),
    INDEX idx_metrics_date (date),
    INDEX idx_metrics_type (type),
    INDEX idx_metrics_trainee_type_date (trainee_id, type, date DESC)
);

COMMENT ON TABLE metrics IS 'ข้อมูลการวัดผล (น้ำหนัก, ไขมัน, กล้ามเนื้อ, รอบวัด)';
COMMENT ON COLUMN metrics.type IS 'ประเภท: weight, body_fat, muscle_mass, measurement';
```

---

### **13. notifications** - การแจ้งเตือน

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    -- Notification Info
    type VARCHAR(50) NOT NULL CHECK (type IN ('schedule', 'progress', 'achievement', 'system', 'message')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related Entity
    related_id BIGINT,
    related_type VARCHAR(50), -- 'schedule', 'session_card', 'program', etc.
    
    -- Action
    action_url TEXT,
    
    -- Priority
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    -- Delivery
    sent_via VARCHAR(50)[], -- ['in_app', 'email', 'push']
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_user_unread (user_id, is_read) WHERE is_read = FALSE,
    INDEX idx_notifications_created_at (created_at DESC)
);

COMMENT ON TABLE notifications IS 'การแจ้งเตือน';
COMMENT ON COLUMN notifications.type IS 'ประเภท: schedule, progress, achievement, system, message';
COMMENT ON COLUMN notifications.related_type IS 'ชนิดของ Entity ที่เกี่ยวข้อง';
```

---

### **14. achievements** - ความสำเร็จ/รางวัล

```sql
CREATE TABLE achievements (
    id BIGSERIAL PRIMARY KEY,
    trainee_id BIGINT NOT NULL,
    
    -- Achievement Info
    type VARCHAR(50) NOT NULL, -- 'streak', 'milestone', 'pr', 'completion'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Badge
    badge_icon TEXT, -- Emoji or URL
    badge_color VARCHAR(7), -- Hex color
    
    -- Stats
    value INTEGER, -- e.g., 5 for "5 day streak"
    
    -- Date
    achieved_at DATE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (trainee_id) REFERENCES trainees(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_achievements_trainee_id (trainee_id),
    INDEX idx_achievements_type (type),
    INDEX idx_achievements_achieved_at (achieved_at DESC)
);

COMMENT ON TABLE achievements IS 'ความสำเร็จ/รางวัล';
COMMENT ON COLUMN achievements.type IS 'ประเภท: streak, milestone, pr, completion';
```

---

### **15. refresh_tokens** - Refresh Tokens (JWT)

```sql
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    -- Token
    token VARCHAR(500) NOT NULL UNIQUE,
    
    -- Expiry
    expires_at TIMESTAMP NOT NULL,
    
    -- Device Info
    device_type VARCHAR(50), -- 'web', 'ios', 'android'
    device_name VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Status
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_refresh_tokens_user_id (user_id),
    INDEX idx_refresh_tokens_token (token),
    INDEX idx_refresh_tokens_expires_at (expires_at)
);

COMMENT ON TABLE refresh_tokens IS 'Refresh Tokens สำหรับ JWT Authentication';
```

---

## 🚀 Indexes & Performance

### **Composite Indexes:**

```sql
-- Schedules: Query by trainee + date range + status
CREATE INDEX idx_schedules_trainee_date_status 
ON schedules(trainee_id, date, status) 
WHERE deleted_at IS NULL;

-- Session Cards: Query by trainee + date (DESC for recent first)
CREATE INDEX idx_session_cards_trainee_recent 
ON session_cards(trainee_id, date DESC) 
WHERE deleted_at IS NULL;

-- Notifications: Unread notifications for user
CREATE INDEX idx_notifications_user_unread_recent 
ON notifications(user_id, created_at DESC) 
WHERE is_read = FALSE AND deleted_at IS NULL;

-- Metrics: Query by trainee + type + date
CREATE INDEX idx_metrics_trainee_type_date 
ON metrics(trainee_id, type, date DESC) 
WHERE deleted_at IS NULL;

-- Program Assignments: Active program per trainee
CREATE INDEX idx_program_assignments_active 
ON program_assignments(trainee_id) 
WHERE status = 'active' AND deleted_at IS NULL;
```

### **Full-Text Search Indexes:**

```sql
-- Exercise Library: Search by name and description
CREATE INDEX idx_exercise_library_search 
ON exercise_library USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Programs: Search by name and description
CREATE INDEX idx_programs_search 
ON programs USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

---

## 📦 Database Migrations

### **Migration 001: Initial Schema**

```sql
-- migrations/000001_initial_schema.up.sql

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('trainer', 'trainee', 'admin');
CREATE TYPE schedule_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE program_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE assignment_status AS ENUM ('active', 'completed', 'paused', 'cancelled');
CREATE TYPE notification_type AS ENUM ('schedule', 'progress', 'achievement', 'system', 'message');

-- Create tables (see above)
-- ...

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainers_updated_at BEFORE UPDATE ON trainers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... (repeat for all tables)
```

### **Migration 002: Add Stats Columns**

```sql
-- migrations/000002_add_stats.up.sql

ALTER TABLE trainees 
ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;

-- Create function to update trainee stats
CREATE OR REPLACE FUNCTION update_trainee_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_sessions when session_card is created
    IF TG_OP = 'INSERT' THEN
        UPDATE trainees 
        SET total_sessions = total_sessions + 1,
            completed_sessions = completed_sessions + 1,
            last_session_date = NEW.date
        WHERE id = NEW.trainee_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trainee_stats_trigger 
AFTER INSERT ON session_cards
FOR EACH ROW EXECUTE FUNCTION update_trainee_stats();
```

---

## 📊 Sample Data

### **Insert Sample Users:**

```sql
-- Sample Trainers
INSERT INTO users (email, password_hash, name, role, phone_number) VALUES
('coach.ben@example.com', '$2a$10$...', 'โค้ชเบน', 'trainer', '0899999999'),
('coach.micky@example.com', '$2a$10$...', 'โค้ชมิกกี้', 'trainer', '0888888888');

INSERT INTO trainers (user_id, bio, specialization, certifications, experience_years, rating) VALUES
(1, 'เทรนเนอร์มืออาชีพ 5 ปี', ARRAY['Strength', 'Bodybuilding'], ARRAY['NASM-CPT', 'ACE'], 5, 4.9),
(2, 'ผู้เชี่ยวชาญด้าน Cardio & HIIT', ARRAY['Cardio', 'HIIT', 'Weight Loss'], ARRAY['ACE', 'ISSA'], 3, 4.8);

-- Sample Trainees
INSERT INTO users (email, password_hash, name, role, phone_number, date_of_birth, gender) VALUES
('somchai@example.com', '$2a$10$...', 'สมชาย ใจดี', 'trainee', '0812345678', '1995-05-15', 'male'),
('somsri@example.com', '$2a$10$...', 'สมศรี สุขใจ', 'trainee', '0823456789', '1998-08-20', 'female');

INSERT INTO trainees (user_id, trainer_id, height, weight, fitness_level, goals) VALUES
(3, 1, 175, 75.5, 'intermediate', ARRAY['เพิ่มกล้ามเนื้อ 5kg', 'ลดไขมัน 3%']),
(4, 2, 165, 60.0, 'beginner', ARRAY['ลดน้ำหนัก 5kg', 'เพิ่มความแข็งแรง']);
```

### **Insert Sample Locations:**

```sql
INSERT INTO locations (name, address, floor, building, phone_number, opening_hours, facilities) VALUES
('สาขาสยาม', 'ชั้น 5 สยามพารากอน กรุงเทพฯ 10330', '5', 'สยามพารากอน', '021234567', '06:00-22:00', 
 ARRAY['Cardio Zone', 'Free Weights', 'Locker Room', 'Shower']),
('สาขาเอกมัย', 'ชั้น 3 Gateway Ekamai', '3', 'Gateway Ekamai', '021234568', '06:00-22:00',
 ARRAY['Cardio Zone', 'Free Weights', 'Functional Training', 'Locker Room']);
```

### **Insert Sample Exercise Library:**

```sql
INSERT INTO exercise_library (name, category, description, muscle_groups, equipment, difficulty, is_public, is_verified) VALUES
('Squat', 'Legs', 'ท่ายอมแบบ Barbell', ARRAY['Quadriceps', 'Glutes', 'Hamstrings'], ARRAY['Barbell', 'Squat Rack'], 'intermediate', TRUE, TRUE),
('Deadlift', 'Legs', 'ยกน้ำหนักจากพื้น', ARRAY['Hamstrings', 'Lower Back', 'Glutes'], ARRAY['Barbell'], 'advanced', TRUE, TRUE),
('Bench Press', 'Chest', 'ท่าดันบาร์บนม้านอน', ARRAY['Pectoralis Major', 'Triceps', 'Shoulders'], ARRAY['Barbell', 'Bench'], 'intermediate', TRUE, TRUE),
('Pull-up', 'Back', 'ท่าดึงตัวขึ้นแบบกำมือคว่ำ', ARRAY['Latissimus Dorsi', 'Biceps'], ARRAY['Pull-up Bar'], 'intermediate', TRUE, TRUE),
('Plank', 'Core', 'ท่าค้ำพื้นแบบนิ่ง', ARRAY['Rectus Abdominis', 'Obliques'], ARRAY['Bodyweight'], 'beginner', TRUE, TRUE);
```

---

## 🔍 Queries Examples

### **1. Get Upcoming Sessions for Trainee (7 days):**

```sql
SELECT 
    s.id,
    s.date,
    s.time,
    s.duration,
    s.title,
    s.status,
    u.name AS trainer_name,
    u.profile_image AS trainer_image,
    l.name AS location_name,
    l.address AS location_address
FROM schedules s
INNER JOIN trainers t ON s.trainer_id = t.id
INNER JOIN users u ON t.user_id = u.id
LEFT JOIN locations l ON s.location_id = l.id
WHERE s.trainee_id = $1
  AND s.date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND s.status IN ('scheduled', 'confirmed')
  AND s.deleted_at IS NULL
ORDER BY s.date ASC, s.time ASC;
```

### **2. Get Current Program for Trainee:**

```sql
SELECT 
    p.id,
    p.name,
    p.description,
    p.total_weeks,
    pa.current_week,
    pa.progress_percentage,
    pa.start_date,
    pa.end_date,
    pa.sessions_completed,
    pa.total_sessions,
    u.name AS trainer_name,
    u.profile_image AS trainer_image
FROM program_assignments pa
INNER JOIN programs p ON pa.program_id = p.id
INNER JOIN trainers t ON p.trainer_id = t.id
INNER JOIN users u ON t.user_id = u.id
WHERE pa.trainee_id = $1
  AND pa.status = 'active'
  AND pa.deleted_at IS NULL
LIMIT 1;
```

### **3. Get Trainee Stats:**

```sql
SELECT 
    t.total_sessions,
    t.completed_sessions,
    t.cancelled_sessions,
    t.current_streak,
    t.longest_streak,
    t.total_workout_hours,
    (
        SELECT COUNT(*) 
        FROM schedules 
        WHERE trainee_id = t.id 
          AND status IN ('scheduled', 'confirmed')
          AND date >= CURRENT_DATE
          AND deleted_at IS NULL
    ) AS upcoming_sessions
FROM trainees t
WHERE t.id = $1;
```

### **4. Get Session Cards with Exercises (History):**

```sql
SELECT 
    sc.id,
    sc.date,
    sc.title,
    sc.duration,
    sc.overall_feedback,
    u.name AS trainer_name,
    u.profile_image AS trainer_image,
    json_agg(
        json_build_object(
            'id', se.id,
            'name', se.name,
            'category', se.category,
            'notes', se.notes,
            'sets', (
                SELECT json_agg(
                    json_build_object(
                        'setNumber', es.set_number,
                        'reps', es.reps,
                        'weight', es.weight,
                        'duration', es.duration,
                        'rest', es.rest_duration,
                        'completed', es.completed
                    ) ORDER BY es.set_number
                )
                FROM exercise_sets es
                WHERE es.session_exercise_id = se.id
            )
        ) ORDER BY se.exercise_order
    ) AS exercises
FROM session_cards sc
INNER JOIN trainers t ON sc.trainer_id = t.id
INNER JOIN users u ON t.user_id = u.id
LEFT JOIN session_exercises se ON sc.id = se.session_card_id
WHERE sc.trainee_id = $1
  AND sc.deleted_at IS NULL
GROUP BY sc.id, u.name, u.profile_image
ORDER BY sc.date DESC
LIMIT $2 OFFSET $3;
```

### **5. Get Metrics (Weight, Body Fat, Muscle Mass):**

```sql
SELECT 
    id,
    date,
    type,
    value,
    unit,
    notes
FROM metrics
WHERE trainee_id = $1
  AND type IN ('weight', 'body_fat', 'muscle_mass')
  AND deleted_at IS NULL
ORDER BY date DESC;
```

### **6. Get Unread Notifications:**

```sql
SELECT 
    id,
    type,
    title,
    message,
    related_id,
    related_type,
    action_url,
    priority,
    created_at
FROM notifications
WHERE user_id = $1
  AND is_read = FALSE
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;
```

### **7. Search Exercise Library:**

```sql
SELECT 
    id,
    name,
    category,
    description,
    muscle_groups,
    equipment,
    difficulty,
    video_url,
    thumbnail_url
FROM exercise_library
WHERE (
    to_tsvector('english', name || ' ' || COALESCE(description, '')) 
    @@ plainto_tsquery('english', $1)
)
  AND (is_public = TRUE OR trainer_id = $2)
  AND deleted_at IS NULL
ORDER BY usage_count DESC
LIMIT 20;
```

---

## 🎯 Database Statistics

### **Storage Estimates:**

| Table | Rows (10K users) | Size (approx) |
|-------|------------------|---------------|
| users | 10,000 | 5 MB |
| trainers | 500 | 200 KB |
| trainees | 9,500 | 10 MB |
| schedules | 200,000 | 100 MB |
| session_cards | 150,000 | 80 MB |
| session_exercises | 750,000 | 200 MB |
| exercise_sets | 3,000,000 | 400 MB |
| notifications | 500,000 | 150 MB |
| metrics | 100,000 | 30 MB |
| exercise_library | 500 | 5 MB |
| **Total** | **~5M rows** | **~1 GB** |

---

## ✅ Best Practices

### **1. Soft Deletes:**
- ใช้ `deleted_at` แทนการลบจริง
- Filter ด้วย `WHERE deleted_at IS NULL` ในทุก query

### **2. Timestamps:**
- ทุกตารางมี `created_at`, `updated_at`
- ใช้ Trigger สำหรับ auto-update `updated_at`

### **3. Indexes:**
- สร้าง index บน Foreign Keys
- สร้าง Composite Indexes สำหรับ common queries
- ใช้ Partial Indexes สำหรับ filtered queries

### **4. Constraints:**
- ใช้ CHECK constraints สำหรับ enums
- ใช้ UNIQUE constraints ตามความเหมาะสม
- ใช้ Foreign Keys พร้อม CASCADE rules

### **5. JSON Fields:**
- ใช้ JSONB แทน JSON (faster queries)
- สร้าง GIN indexes บน JSONB columns

---

## 🚀 Next Steps

1. ✅ Review database design
2. ✅ Create migration files
3. ✅ Setup database in Docker
4. ✅ Run migrations
5. ✅ Insert sample data
6. ✅ Test queries
7. ✅ Implement Backend APIs
8. ✅ Performance testing

---

**Created**: 2026-01-11  
**Version**: 2.0  
**Status**: ✅ Complete Database Design
