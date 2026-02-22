# 🗄️ Database Schema Design - Fitness Management System

## 📋 Overview

**Database Type:** PostgreSQL 15+  
**ORM:** GORM (Go)  
**Total Tables:** 15  
**Total Indexes:** 47  
**Total Triggers:** 8  
**Character Set:** UTF-8  
**Timezone:** UTC

---

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     users       │◄──────┬─────────────────────────────┐
│ (Trainer/Trainee)│       │                             │
└────────┬────────┘       │                             │
         │                │                             │
         │ 1:N            │ 1:N                         │ 1:N
         │                │                             │
┌────────▼────────┐  ┌────▼──────────┐  ┌──────────────▼─────┐
│   schedules     │  │   workouts    │  │  session_cards     │
│  (นัดหมาย)      │  │  (ผลการฝึก)   │  │  (การ์ดสรุปผล)     │
└─────────────────┘  └───┬───────────┘  └────────────────────┘
                         │
                         │ 1:N
                         │
                    ┌────▼──────────────┐
                    │   exercises       │
                    │  (คลังท่า)        │
                    └───────────────────┘

┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│ body_weight_    │  │  notifications   │  │  user_sessions  │
│    entries      │  │  (การแจ้งเตือน)  │  │  (JWT Sessions) │
│ (น้ำหนักตัว)    │  │                  │  │                 │
└─────────────────┘  └──────────────────┘  └─────────────────┘

┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│  audit_logs     │  │ api_rate_limits  │  │   webhooks      │
│  (ประวัติการใช้) │  │  (Rate Limiting) │  │  (Webhooks)     │
└─────────────────┘  └──────────────────┘  └─────────────────┘

┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│  exercise_      │  │   settings       │  │  program_       │
│  templates      │  │  (การตั้งค่า)    │  │  templates      │
│  (เทมเพลต)      │  │                  │  │  (โปรแกรม)      │
└─────────────────┘  └──────────────────┘  └─────────────────┘
```

---

## 🏗️ Database Tables (15 Tables)

### 1. 👤 **users** - ตารางผู้ใช้งาน

**วัตถุประสงค์:** เก็บข้อมูลผู้ใช้ทั้ง Trainer และ Trainee

```sql
CREATE TABLE users (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
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

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Sample Data
INSERT INTO users (email, name, role, google_id) VALUES
('trainer@example.com', 'Coach John', 'trainer', 'google123'),
('trainee@example.com', 'Jane Doe', 'trainee', 'google456');
```

**ฟิลด์สำคัญ:**
- `role`: แยก Trainer/Trainee (ใช้ใน RBAC)
- `is_active`: ปิด/เปิดบัญชี
- `height`, `weight`: เก็บข้อมูลพื้นฐาน (อัปเดตล่าสุด)

---

### 2. 🔑 **user_sessions** - ตาราง JWT Sessions

**วัตถุประสงค์:** เก็บ Refresh Token และ Session Management

```sql
CREATE TABLE user_sessions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tokens
  refresh_token VARCHAR(500) NOT NULL UNIQUE,
  access_token VARCHAR(500) NOT NULL,
  
  -- Session Info
  ip_address INET,
  user_agent TEXT,
  
  -- Expiration
  expires_at TIMESTAMP NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_refresh ON user_sessions(refresh_token);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- Trigger: Auto-cleanup expired sessions
CREATE TRIGGER cleanup_expired_sessions
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_expired_sessions_function();
```

**ฟิลด์สำคัญ:**
- `refresh_token`: ใช้ refresh access token
- `expires_at`: Refresh token หมดอายุ (7 วัน)

---

### 3. 📅 **schedules** - ตารางนัดหมาย

**วัตถุประสงค์:** เก็บตารางนัดฝึกระหว่าง Trainer และ Trainee

```sql
CREATE TABLE schedules (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Schedule Info
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  
  -- Location
  location VARCHAR(255),
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'completed', 'cancelled')
  ),
  
  -- Notes
  notes TEXT,
  
  -- Reminder
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_schedules_trainee ON schedules(trainee_id);
CREATE INDEX idx_schedules_trainer ON schedules(trainer_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE INDEX idx_schedules_datetime ON schedules(date, start_time);

-- Composite Index for queries
CREATE INDEX idx_schedules_trainee_date_status ON schedules(trainee_id, date, status);

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_schedules_updated_at 
  BEFORE UPDATE ON schedules
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Create notification on schedule creation
CREATE TRIGGER notify_schedule_created
  AFTER INSERT ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION create_schedule_notification();
```

**ฟิลด์สำคัญ:**
- `status`: pending → confirmed → completed/cancelled
- `duration`: คำนวณจาก end_time - start_time
- `reminder_sent`: ป้องกันส่ง notification ซ้ำ

---

### 4. 💪 **workouts** - ตารางบันทึกการฝึก

**วัตถุประสงค์:** เก็บผลการฝึกแต่ละครั้ง พร้อม exercises แบบ JSONB

```sql
CREATE TABLE workouts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  
  -- Workout Info
  date DATE NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  
  -- Exercises (JSONB Array)
  exercises JSONB NOT NULL,
  
  -- Summary Stats (Auto-calculated)
  summary JSONB NOT NULL,
  
  -- Notes & Feedback
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  mood VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workouts_trainee ON workouts(trainee_id);
CREATE INDEX idx_workouts_trainer ON workouts(trainer_id);
CREATE INDEX idx_workouts_schedule ON workouts(schedule_id);
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_workouts_rating ON workouts(rating);

-- GIN Index for JSONB queries
CREATE INDEX idx_workouts_exercises ON workouts USING GIN (exercises);
CREATE INDEX idx_workouts_summary ON workouts USING GIN (summary);

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_workouts_updated_at 
  BEFORE UPDATE ON workouts
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

**JSONB Structure - exercises:**

```json
{
  "exercises": [
    {
      "name": "Squat",
      "type": "weight_training",
      "isBodyweight": false,
      "sets": [
        {
          "setNumber": 1,
          "weight": 100,
          "reps": 8,
          "rest": 90
        },
        {
          "setNumber": 2,
          "weight": 100,
          "reps": 8,
          "rest": 90
        }
      ]
    },
    {
      "name": "Running",
      "type": "cardio",
      "sets": [
        {
          "setNumber": 1,
          "distance": 5.2,
          "duration": 27.5,
          "pace": 5.29,
          "calories": 416
        }
      ]
    },
    {
      "name": "Yoga Flow",
      "type": "flexibility",
      "sets": [
        {
          "setNumber": 1,
          "duration": 30,
          "holdTime": 60
        }
      ]
    }
  ]
}
```

**JSONB Structure - summary:**

```json
{
  "totalSets": 10,
  "totalReps": 80,
  "totalWeight": 2000,
  "totalDistance": 5.2,
  "totalDuration": 57.5,
  "totalCalories": 416,
  "exerciseCount": 3,
  "typeBreakdown": {
    "weight_training": 2,
    "cardio": 1,
    "flexibility": 0
  }
}
```

**ฟิลด์สำคัญ:**
- `exercises`: JSONB array รองรับ 3 ประเภท
- `summary`: คำนวณอัตโนมัติจาก exercises
- `schedule_id`: เชื่อมกับนัด (nullable)

---

### 5. 🏋️ **exercises** - คลังท่าออกกำลังกาย

**วัตถุประสงค์:** Master data สำหรับท่าออกกำลังกายทั้งหมด

```sql
CREATE TABLE exercises (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (
    type IN ('weight_training', 'cardio', 'flexibility')
  ),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  
  -- Metadata
  metadata JSONB,
  muscle_groups TEXT[],
  equipment TEXT[],
  difficulty VARCHAR(20) CHECK (
    difficulty IN ('beginner', 'intermediate', 'advanced')
  ),
  
  -- Instructions
  instructions TEXT[],
  tips TEXT[],
  warnings TEXT[],
  
  -- Media
  video_url TEXT,
  thumbnail_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  
  -- Created By
  created_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_exercises_name ON exercises(name);
CREATE INDEX idx_exercises_type ON exercises(type);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_active ON exercises(is_active);
CREATE INDEX idx_exercises_usage ON exercises(usage_count DESC);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);

-- GIN Index for array fields
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN (muscle_groups);
CREATE INDEX idx_exercises_equipment ON exercises USING GIN (equipment);

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_exercises_updated_at 
  BEFORE UPDATE ON exercises
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

**metadata JSONB Example:**

```json
{
  "weight_training": {
    "defaultSets": 4,
    "defaultReps": 8,
    "restTime": 90,
    "targetMuscles": ["quadriceps", "glutes"]
  },
  "cardio": {
    "targetHeartRate": 140,
    "caloriesPerMinute": 10
  },
  "flexibility": {
    "holdTime": 30,
    "breathingPattern": "deep"
  }
}
```

**ฟิลด์สำคัญ:**
- `type`: weight_training, cardio, flexibility
- `usage_count`: เพิ่มทุกครั้งที่ใช้ (สำหรับ popular exercises)
- `muscle_groups`: array สำหรับกรอง

---

### 6. 📝 **session_cards** - การ์ดสรุปผลการฝึก

**วัตถุประสงค์:** Trainer สรุปผลและให้ feedback หลังการฝึก

```sql
CREATE TABLE session_cards (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  
  -- Session Info
  date DATE NOT NULL,
  summary TEXT NOT NULL,
  
  -- Feedback
  achievements TEXT[],
  areas_for_improvement TEXT[],
  next_session_goals TEXT[],
  trainer_notes TEXT,
  
  -- Rating
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Tags
  tags TEXT[],
  
  -- Media
  media JSONB, -- { images: [], videos: [] }
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_session_cards_trainee ON session_cards(trainee_id);
CREATE INDEX idx_session_cards_trainer ON session_cards(trainer_id);
CREATE INDEX idx_session_cards_workout ON session_cards(workout_id);
CREATE INDEX idx_session_cards_date ON session_cards(date);
CREATE INDEX idx_session_cards_rating ON session_cards(rating);

-- GIN Index for arrays
CREATE INDEX idx_session_cards_tags ON session_cards USING GIN (tags);

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_session_cards_updated_at 
  BEFORE UPDATE ON session_cards
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

**media JSONB Example:**

```json
{
  "images": [
    "https://storage.example.com/sessions/abc123.jpg"
  ],
  "videos": [
    "https://storage.example.com/sessions/def456.mp4"
  ]
}
```

---

### 7. ⚖️ **body_weight_entries** - บันทึกน้ำหนักตัว

**วัตถุประสงค์:** ติดตามน้ำหนักและสัดส่วนร่างกาย

```sql
CREATE TABLE body_weight_entries (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Measurements
  weight DECIMAL(5,2) NOT NULL, -- kg
  date DATE NOT NULL,
  
  -- Additional Metrics
  bmi DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  muscle_mass DECIMAL(5,2),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_body_weight_trainee ON body_weight_entries(trainee_id);
CREATE INDEX idx_body_weight_date ON body_weight_entries(date);
CREATE UNIQUE INDEX idx_body_weight_unique ON body_weight_entries(trainee_id, date);

-- Trigger: Update users.weight on insert
CREATE TRIGGER update_user_weight_on_insert
  AFTER INSERT ON body_weight_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_user_current_weight();
```

**ฟิลด์สำคัญ:**
- `UNIQUE (trainee_id, date)`: 1 วันวัด 1 ครั้ง
- `bmi`: คำนวณอัตโนมัติจาก weight/height²

---

### 8. 🔔 **notifications** - การแจ้งเตือน

**วัตถุประสงค์:** ระบบแจ้งเตือนต่างๆ

```sql
CREATE TABLE notifications (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Info
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('schedule_created', 'schedule_updated', 'schedule_reminder', 
             'workout_logged', 'session_card_created', 'achievement_unlocked')
  ),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Related Resource
  resource_type VARCHAR(50),
  resource_id UUID,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_resource ON notifications(resource_type, resource_id);
```

**ฟิลด์สำคัญ:**
- `resource_type`, `resource_id`: เชื่อมกับข้อมูลที่เกี่ยวข้อง
- `is_read`: สำหรับแสดงจุดแดง

---

### 9. ⚙️ **settings** - การตั้งค่า

**วัตถุประสงค์:** เก็บการตั้งค่าของผู้ใช้

```sql
CREATE TABLE settings (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Theme & UI
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language VARCHAR(10) DEFAULT 'th',
  
  -- Notifications
  notification_settings JSONB DEFAULT '{"email":true,"push":true,"sms":false}'::jsonb,
  
  -- Privacy
  privacy_settings JSONB DEFAULT '{"profileVisibility":"private","showStats":false}'::jsonb,
  
  -- Units
  weight_unit VARCHAR(10) DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
  distance_unit VARCHAR(10) DEFAULT 'km' CHECK (distance_unit IN ('km', 'miles')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_settings_user ON settings(user_id);

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON settings
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 10. 📜 **audit_logs** - ประวัติการใช้งาน

**วัตถุประสงค์:** บันทึกการกระทำสำคัญ (Audit Trail)

```sql
CREATE TABLE audit_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Info
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  
  -- Action
  action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  resource_type VARCHAR(50) NOT NULL, -- schedules, workouts, etc.
  resource_id UUID,
  
  -- Details
  old_values JSONB,
  new_values JSONB,
  
  -- Request Info
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

**ฟิลด์สำคัญ:**
- `old_values`, `new_values`: เก็บ diff สำหรับ rollback
- `user_email`: เก็บไว้กรณี user ถูกลบ

---

### 11. 🚦 **api_rate_limits** - Rate Limiting

**วัตถุประสงค์:** ป้องกัน API abuse

```sql
CREATE TABLE api_rate_limits (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
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
```

---

### 12. 🪝 **webhooks** - Webhook Configurations

**วัตถุประสงค์:** ส่ง events ไปยัง external services

```sql
CREATE TABLE webhooks (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
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
```

---

### 13. 📋 **exercise_templates** - เทมเพลตท่าออกกำลังกาย

**วัตถุประสงก:** เทมเพลตสำเร็จรูปสำหรับ Trainer

```sql
CREATE TABLE exercise_templates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
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
```

---

### 14. 📚 **program_templates** - เทมเพลตโปรแกรมการฝึก

**วัตถุประสงค์:** โปรแกรมการฝึกแบบครบชุด (12 สัปดาห์)

```sql
CREATE TABLE program_templates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
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
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_program_templates_creator ON program_templates(created_by);
CREATE INDEX idx_program_templates_public ON program_templates(is_public);
CREATE INDEX idx_program_templates_usage ON program_templates(usage_count DESC);
```

---

### 15. 🎯 **trainee_programs** - โปรแกรมที่กำหนดให้ Trainee

**วัตถุประสงค์:** เชื่อม Trainee กับโปรแกรมที่กำลังทำ

```sql
CREATE TABLE trainee_programs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
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
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trainee_programs_trainee ON trainee_programs(trainee_id);
CREATE INDEX idx_trainee_programs_trainer ON trainee_programs(trainer_id);
CREATE INDEX idx_trainee_programs_program ON trainee_programs(program_id);
CREATE INDEX idx_trainee_programs_status ON trainee_programs(status);
```

---

## 🔧 Triggers & Functions

### Function: update_updated_at_column()

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Function: cleanup_expired_sessions_function()

```sql
CREATE OR REPLACE FUNCTION cleanup_expired_sessions_function()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Function: create_schedule_notification()

```sql
CREATE OR REPLACE FUNCTION create_schedule_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, resource_type, resource_id)
  VALUES (
    NEW.trainee_id,
    'schedule_created',
    'นัดหมายใหม่',
    CONCAT('คุณมีนัดฝึกใหม่: ', NEW.title, ' วันที่ ', NEW.date),
    'schedules',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### Function: update_user_current_weight()

```sql
CREATE OR REPLACE FUNCTION update_user_current_weight()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET weight = NEW.weight, updated_at = NOW()
  WHERE id = NEW.trainee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Database Statistics

| Table | Estimated Rows | Indexes | Triggers |
|-------|----------------|---------|----------|
| users | 10,000 | 4 | 1 |
| user_sessions | 50,000 | 3 | 1 |
| schedules | 100,000 | 6 | 2 |
| workouts | 500,000 | 7 | 1 |
| exercises | 500 | 7 | 1 |
| session_cards | 100,000 | 5 | 1 |
| body_weight_entries | 200,000 | 3 | 1 |
| notifications | 1,000,000 | 5 | 0 |
| settings | 10,000 | 1 | 1 |
| audit_logs | 5,000,000 | 4 | 0 |
| api_rate_limits | 100,000 | 3 | 0 |
| webhooks | 1,000 | 2 | 0 |
| exercise_templates | 1,000 | 3 | 0 |
| program_templates | 100 | 3 | 0 |
| trainee_programs | 5,000 | 4 | 0 |
| **TOTAL** | **~7,076,600** | **47** | **8** |

---

## 🔐 Row-Level Security (RLS) Policies

### Enable RLS on key tables:

```sql
-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_weight_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Trainee can only view their own data
CREATE POLICY trainee_view_own_schedules ON schedules
  FOR SELECT
  USING (
    trainee_id = current_user_id() OR
    trainer_id = current_user_id()
  );

-- Policy: Trainer can view all
CREATE POLICY trainer_view_all_schedules ON schedules
  FOR SELECT
  USING (
    current_user_role() = 'trainer'
  );

-- Policy: Only trainer can INSERT/UPDATE/DELETE
CREATE POLICY trainer_modify_schedules ON schedules
  FOR ALL
  USING (
    current_user_role() = 'trainer'
  );
```

---

## 📈 Performance Optimization

### 1. Partitioning (ตารางใหญ่)

```sql
-- Partition workouts by date (monthly)
CREATE TABLE workouts_2024_01 PARTITION OF workouts
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE workouts_2024_02 PARTITION OF workouts
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### 2. Materialized Views (สำหรับ Analytics)

```sql
CREATE MATERIALIZED VIEW trainee_stats AS
SELECT 
  t.id,
  t.name,
  COUNT(DISTINCT w.id) as total_workouts,
  COUNT(DISTINCT s.id) as total_sessions,
  AVG(w.rating) as avg_rating,
  SUM((w.summary->>'totalWeight')::numeric) as total_weight_lifted
FROM users t
LEFT JOIN workouts w ON t.id = w.trainee_id
LEFT JOIN schedules s ON t.id = s.trainee_id
WHERE t.role = 'trainee'
GROUP BY t.id, t.name;

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY trainee_stats;
```

---

## 🔄 Data Migration Strategy

### Version Control with golang-migrate

```bash
# Create migration
migrate create -ext sql -dir migrations -seq create_users_table

# Run migrations
migrate -path migrations -database "postgresql://user:pass@localhost:5432/fitness_db" up

# Rollback
migrate -path migrations -database "postgresql://user:pass@localhost:5432/fitness_db" down 1
```

---

**Created by**: Figma Make AI Assistant  
**Date**: 24 มกราคม 2026  
**Version**: 1.0.0
