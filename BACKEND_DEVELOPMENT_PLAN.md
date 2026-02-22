# 🚀 Backend Development Plan - Fitness Management System

## 📋 Table of Contents

1. [API Overview](#api-overview)
2. [Development Priorities](#development-priorities)
3. [Phase 1: Core Authentication & Users](#phase-1-core-authentication--users)
4. [Phase 2: Schedule & Workout Management](#phase-2-schedule--workout-management)
5. [Phase 3: Progress & Analytics](#phase-3-progress--analytics)
6. [Phase 4: Notifications & Polish](#phase-4-notifications--polish)
7. [Database Schema](#database-schema)
8. [Tech Stack](#tech-stack)
9. [Development Timeline](#development-timeline)
10. [Testing Strategy](#testing-strategy)

---

## API Overview

### 📊 Total: **57 API Endpoints**

| Category | Count | Priority | Complexity |
|----------|-------|----------|------------|
| 🔐 Authentication | 5 | P0 | Medium |
| 👤 User Management | 5 | P0 | Low |
| 📅 Schedule Management | 6 | P0 | Medium |
| 💪 Workout Management | 6 | P0 | High |
| 🏋️ Exercise Management | 6 | P1 | Medium |
| 📝 Session Cards | 5 | P1 | Low |
| 📈 Progress Tracking | 4 | P1 | High |
| 🔔 Notifications | 6 | P2 | Medium |
| 📊 Analytics | 3 | P2 | High |
| ⚙️ Settings | 2 | P2 | Low |
| 🧪 Testing/Health | 2 | P0 | Low |

**Priority Levels:**
- **P0**: Must-have for MVP (Core functionality)
- **P1**: Important for launch (Enhanced features)
- **P2**: Nice-to-have (Advanced features)

---

## Development Priorities

### 🔴 P0 - Critical (MVP) - 24 APIs

Must have before launch. Core functionality.

**Week 1-2:**
1. Authentication (5 APIs)
2. User Management (5 APIs)
3. Health Check (2 APIs)

**Week 3-4:**
4. Schedule Management (6 APIs)
5. Workout Management (6 APIs)

### 🟡 P1 - Important (Launch) - 15 APIs

Important for complete user experience.

**Week 5-6:**
6. Exercise Management (6 APIs)
7. Session Cards (5 APIs)
8. Progress Tracking (4 APIs)

### 🟢 P2 - Nice-to-have (Post-Launch) - 18 APIs

Can be added after launch.

**Week 7+:**
9. Notifications (6 APIs)
10. Analytics (3 APIs)
11. Settings (2 APIs)

---

## Phase 1: Core Authentication & Users

**Duration:** Week 1-2 (10 days)  
**Total APIs:** 12

### 1.1 Authentication APIs (5) 🔐

| # | Endpoint | Method | Permission | Priority | Notes |
|---|----------|--------|------------|----------|-------|
| 1 | `/auth/google` | GET | Public | P0 | Initialize OAuth |
| 2 | `/auth/google/callback` | POST | Public | P0 | Handle callback |
| 3 | `/auth/refresh` | POST | Auth | P0 | Refresh token |
| 4 | `/auth/logout` | POST | Auth | P0 | Logout user |
| 5 | `/auth/verify` | GET | Auth | P0 | Verify token |

**Dependencies:**
- Supabase Auth setup
- Google OAuth credentials
- JWT token generation

**Complexity:** Medium  
**Estimated Time:** 3-4 days

---

### 1.2 User Management APIs (5) 👤

| # | Endpoint | Method | Permission | Priority | Notes |
|---|----------|--------|------------|----------|-------|
| 6 | `/users/me` | GET | Auth | P0 | Get current user |
| 7 | `/users/me` | PATCH | Auth | P0 | Update profile |
| 8 | `/users/:userId` | GET | Trainer | P0 | Get user by ID |
| 9 | `/users` | GET | Trainer | P0 | List all users |
| 10 | `/users/:userId/stats` | GET | Auth | P0 | Get user stats |

**Dependencies:**
- User table
- Role-based middleware
- Stats calculation

**Complexity:** Low  
**Estimated Time:** 2-3 days

---

### 1.3 Health & Testing APIs (2) 🧪

| # | Endpoint | Method | Permission | Priority | Notes |
|---|----------|--------|------------|----------|-------|
| 11 | `/health` | GET | Public | P0 | Health check |
| 12 | `/info` | GET | Public | P0 | API info |

**Dependencies:**
- Database connection check
- Redis connection check (if used)

**Complexity:** Low  
**Estimated Time:** 1 day

---

## Phase 2: Schedule & Workout Management

**Duration:** Week 3-4 (10 days)  
**Total APIs:** 12

### 2.1 Schedule Management APIs (6) 📅

| # | Endpoint | Method | Permission | Priority | Notes |
|---|----------|--------|------------|----------|-------|
| 13 | `/schedules` | POST | Trainer | P0 | Create schedule |
| 14 | `/schedules` | GET | Auth | P0 | List schedules |
| 15 | `/schedules/:id` | GET | Auth | P0 | Get schedule |
| 16 | `/schedules/:id` | PATCH | Trainer | P0 | Update schedule |
| 17 | `/schedules/:id/status` | PATCH | Trainer | P0 | Update status |
| 18 | `/schedules/:id` | DELETE | Trainer | P0 | Delete schedule |

**Dependencies:**
- Schedule table
- Trainee-Trainer relationship
- Conflict detection logic
- Status enum (upcoming, completed, cancelled)

**Complexity:** Medium  
**Estimated Time:** 4-5 days

**Key Features:**
- ✅ CRUD operations
- ✅ Filter by trainee/trainer/date/status
- ✅ Pagination
- ✅ Conflict detection
- ✅ Role-based access

---

### 2.2 Workout Management APIs (6) 💪

| # | Endpoint | Method | Permission | Priority | Notes |
|---|----------|--------|------------|----------|-------|
| 19 | `/workouts` | POST | Trainer | P0 | Create workout |
| 20 | `/workouts` | GET | Auth | P0 | List workouts |
| 21 | `/workouts/:id` | GET | Auth | P0 | Get workout |
| 22 | `/workouts/:id` | PATCH | Trainer | P0 | Update workout |
| 23 | `/workouts/:id` | DELETE | Trainer | P0 | Delete workout |
| 24 | `/workouts/summary` | GET | Auth | P0 | Get summary |

**Dependencies:**
- Workout table
- Exercise table (nested)
- ExerciseSet table (nested)
- 3 Exercise Types support
- Volume/Distance calculations

**Complexity:** High  
**Estimated Time:** 5-6 days

**Key Features:**
- ✅ Support 3 exercise types (weight_training, cardio, flexibility)
- ✅ Nested exercise sets
- ✅ Auto-calculate totals (volume, distance, calories)
- ✅ Personal best detection
- ✅ Filter by type/trainee/date
- ✅ Pagination

**Data Structure:**
```json
{
  "workoutId": "...",
  "exercises": [
    {
      "name": "Squat",
      "type": "weight_training",
      "sets": [
        {"weight": 100, "reps": 8},
        {"weight": 100, "reps": 8}
      ]
    }
  ]
}
```

---

## Phase 3: Progress & Analytics

**Duration:** Week 5-6 (10 days)  
**Total APIs:** 15

### 3.1 Exercise Management APIs (6) 🏋️

| # | Endpoint | Method | Permission | Priority | Notes |
|---|----------|--------|------------|----------|-------|
| 25 | `/exercises` | POST | Trainer | P1 | Create exercise |
| 26 | `/exercises` | GET | Auth | P1 | List exercises |
| 27 | `/exercises/:id` | GET | Auth | P1 | Get exercise |
| 28 | `/exercises/:id` | PATCH | Trainer | P1 | Update exercise |
| 29 | `/exercises/:id` | DELETE | Trainer | P1 | Delete exercise |
| 30 | `/exercises/categories` | GET | Auth | P1 | Get categories |

**Dependencies:**
- Exercise library table
- Category/Muscle group tables
- Equipment table
- Media storage (videos, images)

**Complexity:** Medium  
**Estimated Time:** 3-4 days

**Key Features:**
- ✅ Exercise library management
- ✅ 3 types: weight_training, cardio, flexibility
- ✅ Rich metadata (instructions, tips, warnings)
- ✅ Video/Image attachments
- ✅ Muscle groups & equipment
- ✅ Difficulty levels
- ✅ Search & filter

---

### 3.2 Session Card APIs (5) 📝

| # | Endpoint | Method | Permission | Priority | Notes |
|---|----------|--------|------------|----------|-------|
| 31 | `/session-cards` | POST | Trainer | P1 | Create card |
| 32 | `/session-cards` | GET | Auth | P1 | List cards |
| 33 | `/session-cards/:id` | GET | Auth | P1 | Get card |
| 34 | `/session-cards/:id` | PATCH | Trainer | P1 | Update card |
| 35 | `/session-cards/:id` | DELETE | Trainer | P1 | Delete card |

**Dependencies:**
- SessionCard table
- Link to Workout
- Media storage (optional photos)

**Complexity:** Low  
**Estimated Time:** 2-3 days

**Key Features:**
- ✅ Trainer feedback/notes
- ✅ Achievements list
- ✅ Areas for improvement
- ✅ Next session goals
- ✅ Rating & tags
- ✅ Filter by trainee/date/rating

---

### 3.3 Progress Tracking APIs (4) 📈

| # | Endpoint | Method | Permission | Priority | Notes |
|---|----------|--------|------------|----------|-------|
| 36 | `/progress/exercises/:name` | GET | Auth | P1 | Exercise progress |
| 37 | `/progress/body-weight` | GET | Auth | P1 | Weight progress |
| 38 | `/progress/body-weight` | POST | Trainer | P1 | Add weight entry |
| 39 | `/progress/overall` | GET | Auth | P1 | Overall progress |

**Dependencies:**
- Historical workout data
- Body weight tracking table
- Complex calculations (improvements, trends)
- Date range filtering

**Complexity:** High  
**Estimated Time:** 4-5 days

**Key Features:**
- ✅ Exercise history & trends
- ✅ Personal best tracking
- ✅ Improvement percentage
- ✅ Body weight tracking
- ✅ Overall stats (volume, distance, calories)
- ✅ Weekly/Monthly trends
- ✅ Consistency calculation

---

## Phase 4: Notifications & Polish

**Duration:** Week 7+ (10+ days)  
**Total APIs:** 18

### 4.1 Notification APIs (6) 🔔

| # | Endpoint | Method | Permission | Priority | Notes |
|---|----------|--------|------------|----------|-------|
| 40 | `/notifications` | GET | Auth | P2 | List notifications |
| 41 | `/notifications/:id/read` | PATCH | Auth | P2 | Mark as read |
| 42 | `/notifications/read-all` | PATCH | Auth | P2 | Mark all read |
| 43 | `/notifications/:id` | DELETE | Auth | P2 | Delete notification |
| 44 | `/notifications/settings` | GET | Auth | P2 | Get settings |
| 45 | `/notifications/settings` | PATCH | Auth | P2 | Update settings |

**Dependencies:**
- Notification table
- Background job queue
- Email service (SendGrid/AWS SES)
- Push notification service (FCM)
- SMS service (optional - Twilio)

**Complexity:** Medium  
**Estimated Time:** 4-5 days

**Key Features:**
- ✅ Multiple types (schedule, workout, achievement, reminder, system)
- ✅ Read/Unread status
- ✅ Multiple channels (email, push, SMS)
- ✅ User preferences
- ✅ Scheduled reminders

---

### 4.2 Analytics APIs (3) 📊

| # | Endpoint | Method | Permission | Priority | Notes |
|---|----------|--------|------------|----------|-------|
| 46 | `/analytics/dashboard` | GET | Trainer | P2 | Dashboard stats |
| 47 | `/analytics/trainees/:id/report` | GET | Trainer | P2 | Performance report |
| 48 | `/analytics/exercises/stats` | GET | Trainer | P2 | Exercise stats |

**Dependencies:**
- Complex aggregations
- Historical data analysis
- Caching (Redis)
- Report generation

**Complexity:** High  
**Estimated Time:** 5-6 days

**Key Features:**
- ✅ Trainer dashboard overview
- ✅ Trainee performance reports
- ✅ Exercise usage statistics
- ✅ Trend analysis
- ✅ Comparison over time
- ✅ Export to PDF (future)

---

### 4.3 Settings APIs (2) ⚙️

| # | Endpoint | Method | Permission | Priority | Notes |
|---|----------|--------|------------|----------|-------|
| 49 | `/settings` | GET | Auth | P2 | Get settings |
| 50 | `/settings` | PATCH | Auth | P2 | Update settings |

**Dependencies:**
- User settings table
- Default values

**Complexity:** Low  
**Estimated Time:** 1-2 days

**Key Features:**
- ✅ Language & timezone
- ✅ Theme (light/dark)
- ✅ Measurement units
- ✅ Privacy settings
- ✅ Appearance preferences

---

## Database Schema

### Core Tables (15)

#### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('trainee', 'trainer', 'admin')),
  avatar TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  phone VARCHAR(20),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### 2. schedules
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  exercises TEXT[] NOT NULL,
  location TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
  reminder JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schedules_trainee ON schedules(trainee_id);
CREATE INDEX idx_schedules_trainer ON schedules(trainer_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_status ON schedules(status);
CREATE UNIQUE INDEX idx_schedules_unique ON schedules(trainee_id, date, time) WHERE status != 'cancelled';
```

#### 3. workouts
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  exercises JSONB NOT NULL, -- array of exercise objects
  summary JSONB NOT NULL,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  mood VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workouts_trainee ON workouts(trainee_id);
CREATE INDEX idx_workouts_trainer ON workouts(trainer_id);
CREATE INDEX idx_workouts_date ON workouts(date);
CREATE INDEX idx_workouts_rating ON workouts(rating);
```

#### 4. exercises
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('weight_training', 'cardio', 'flexibility')),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  muscle_groups TEXT[],
  equipment TEXT[],
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  instructions TEXT[],
  tips TEXT[],
  warnings TEXT[],
  video_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exercises_name ON exercises(name);
CREATE INDEX idx_exercises_type ON exercises(type);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_active ON exercises(is_active);
CREATE INDEX idx_exercises_usage ON exercises(usage_count DESC);
```

#### 5. session_cards
```sql
CREATE TABLE session_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  summary TEXT NOT NULL,
  achievements TEXT[],
  areas_for_improvement TEXT[],
  next_session_goals TEXT[],
  trainer_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[],
  media JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_cards_trainee ON session_cards(trainee_id);
CREATE INDEX idx_session_cards_trainer ON session_cards(trainer_id);
CREATE INDEX idx_session_cards_workout ON session_cards(workout_id);
CREATE INDEX idx_session_cards_date ON session_cards(date);
CREATE INDEX idx_session_cards_rating ON session_cards(rating);
```

#### 6. body_weight_entries
```sql
CREATE TABLE body_weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL,
  bmi DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  muscle_mass DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_body_weight_trainee ON body_weight_entries(trainee_id);
CREATE INDEX idx_body_weight_date ON body_weight_entries(date);
CREATE UNIQUE INDEX idx_body_weight_unique ON body_weight_entries(trainee_id, date);
```

#### 7. notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('schedule', 'workout', 'achievement', 'reminder', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  action_url TEXT,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### 8. notification_settings
```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT TRUE,
  email_schedule BOOLEAN DEFAULT TRUE,
  email_workout BOOLEAN DEFAULT TRUE,
  email_achievement BOOLEAN DEFAULT TRUE,
  email_reminder BOOLEAN DEFAULT TRUE,
  email_system BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  push_schedule BOOLEAN DEFAULT TRUE,
  push_workout BOOLEAN DEFAULT TRUE,
  push_achievement BOOLEAN DEFAULT TRUE,
  push_reminder BOOLEAN DEFAULT TRUE,
  push_system BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  sms_schedule BOOLEAN DEFAULT FALSE,
  sms_workout BOOLEAN DEFAULT FALSE,
  sms_achievement BOOLEAN DEFAULT FALSE,
  sms_reminder BOOLEAN DEFAULT FALSE,
  sms_system BOOLEAN DEFAULT FALSE,
  reminders JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_settings_user ON notification_settings(user_id);
```

#### 9. user_settings
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(10) DEFAULT 'th',
  timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  time_format VARCHAR(10) DEFAULT '24h',
  theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  accent_color VARCHAR(10) DEFAULT '#FF6B35',
  font_size VARCHAR(20) DEFAULT 'medium',
  profile_visibility VARCHAR(20) DEFAULT 'public',
  show_stats BOOLEAN DEFAULT TRUE,
  allow_trainer_access BOOLEAN DEFAULT TRUE,
  weight_unit VARCHAR(10) DEFAULT 'kg',
  distance_unit VARCHAR(10) DEFAULT 'km',
  height_unit VARCHAR(10) DEFAULT 'cm',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);
```

#### 10. trainee_trainer_relationships
```sql
CREATE TABLE trainee_trainer_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive', 'terminated')),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(trainee_id, trainer_id)
);

CREATE INDEX idx_relationships_trainee ON trainee_trainer_relationships(trainee_id);
CREATE INDEX idx_relationships_trainer ON trainee_trainer_relationships(trainer_id);
CREATE INDEX idx_relationships_status ON trainee_trainer_relationships(status);
```

#### 11. exercise_categories
```sql
CREATE TABLE exercise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  name_local VARCHAR(100),
  icon VARCHAR(10),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO exercise_categories (name, name_local, icon) VALUES
  ('legs', 'ขา', '🦵'),
  ('chest', 'อก', '💪'),
  ('back', 'หลัง', '🔙'),
  ('shoulders', 'ไหล่', '💪'),
  ('arms', 'แขน', '💪'),
  ('core', 'แกนกลาง', '🎯'),
  ('cardio', 'คาร์ดิโอ', '🏃'),
  ('flexibility', 'เฟล็กซ์', '🧘');
```

#### 12. refresh_tokens
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
```

#### 13. audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

#### 14. api_rate_limits
```sql
CREATE TABLE api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address INET,
  endpoint VARCHAR(255) NOT NULL,
  requests_count INTEGER DEFAULT 1,
  window_start TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_user ON api_rate_limits(user_id, window_start);
CREATE INDEX idx_rate_limits_ip ON api_rate_limits(ip_address, window_start);
```

#### 15. webhooks
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhooks_user ON webhooks(user_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
```

---

## Tech Stack

### Backend Framework
- **Go 1.21+** with **Gin Framework**
- RESTful API design
- Clean Architecture pattern

### Database
- **PostgreSQL 15+** (Primary database)
- **Redis 7+** (Caching & sessions)

### Authentication
- **Supabase Auth** (Google OAuth 2.0)
- JWT tokens
- HTTP-only cookies for refresh tokens

### Storage
- **Supabase Storage** (Images, videos, files)
- CDN for media delivery

### Background Jobs
- **Redis Queue** or **AWS SQS**
- Cron jobs for reminders

### Monitoring & Logging
- **Structured logging** (zerolog)
- **Error tracking** (Sentry)
- **APM** (New Relic / DataDog)

### Email & Notifications
- **SendGrid** or **AWS SES** (Email)
- **Firebase Cloud Messaging** (Push notifications)
- **Twilio** (SMS - optional)

### Testing
- **Go testing** (Unit tests)
- **Testify** (Assertions)
- **Mockery** (Mocks)
- **Postman/Thunder Client** (API testing)

### DevOps
- **Docker** & **Docker Compose**
- **GitHub Actions** (CI/CD)
- **Railway** or **AWS ECS** (Deployment)

---

## Development Timeline

### 📅 8-Week Development Plan

#### **Week 1-2: Foundation** (P0)
- ✅ Project setup & architecture
- ✅ Database schema design
- ✅ Authentication APIs (5)
- ✅ User Management APIs (5)
- ✅ Health Check APIs (2)
- ✅ Middleware (auth, RBAC, rate limiting)

**Deliverable:** User can login with Google, view/update profile

---

#### **Week 3-4: Core Features** (P0)
- ✅ Schedule Management APIs (6)
- ✅ Workout Management APIs (6)
- ✅ CRUD operations
- ✅ Role-based permissions
- ✅ Data validation

**Deliverable:** Trainer can create schedules and log workouts

---

#### **Week 5-6: Enhanced Features** (P1)
- ✅ Exercise Management APIs (6)
- ✅ Session Cards APIs (5)
- ✅ Progress Tracking APIs (4)
- ✅ Complex calculations
- ✅ Historical data analysis

**Deliverable:** Complete progress tracking and feedback system

---

#### **Week 7-8: Advanced Features** (P2)
- ✅ Notification APIs (6)
- ✅ Analytics APIs (3)
- ✅ Settings APIs (2)
- ✅ Background jobs
- ✅ Performance optimization

**Deliverable:** Full-featured system with analytics

---

#### **Week 9+: Polish & Launch**
- ✅ Integration testing
- ✅ Performance testing
- ✅ Security audit
- ✅ Documentation
- ✅ Deployment
- ✅ Monitoring setup

**Deliverable:** Production-ready API

---

## Testing Strategy

### 1. Unit Tests
```go
// Example: User service test
func TestCreateUser(t *testing.T) {
    // Arrange
    userRepo := mocks.NewUserRepository()
    userService := NewUserService(userRepo)
    
    // Act
    user, err := userService.Create(ctx, createUserDTO)
    
    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, user)
    assert.Equal(t, "trainee", user.Role)
}
```

**Coverage Target:** 80%+

### 2. Integration Tests
```go
// Example: API endpoint test
func TestCreateSchedule(t *testing.T) {
    // Setup
    router := setupTestRouter()
    
    // Create request
    body := `{"traineeId":"...","date":"2026-01-25"}`
    req := httptest.NewRequest("POST", "/api/v1/schedules", strings.NewReader(body))
    req.Header.Set("Authorization", "Bearer "+testToken)
    
    // Execute
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)
    
    // Assert
    assert.Equal(t, 201, w.Code)
}
```

### 3. API Tests (Postman)
- Collection for all 57 endpoints
- Environment variables for tokens
- Pre-request scripts for auth
- Tests for response structure

### 4. Load Tests (k6)
```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function() {
  const res = http.get('https://api.fitness-app.com/workouts');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

**Target Performance:**
- Response time: < 200ms (p95)
- Throughput: 1000 req/s
- Error rate: < 0.1%

---

## API Implementation Checklist

### For Each Endpoint:

#### 1. Route Definition
```go
// routes/schedule.go
func SetupScheduleRoutes(r *gin.RouterGroup, handler *ScheduleHandler) {
    schedules := r.Group("/schedules")
    {
        schedules.POST("", middleware.RequireRole("trainer"), handler.Create)
        schedules.GET("", middleware.RequireAuth(), handler.List)
        schedules.GET("/:id", middleware.RequireAuth(), handler.GetByID)
        schedules.PATCH("/:id", middleware.RequireRole("trainer"), handler.Update)
        schedules.DELETE("/:id", middleware.RequireRole("trainer"), handler.Delete)
    }
}
```

#### 2. Handler
```go
// handlers/schedule_handler.go
func (h *ScheduleHandler) Create(c *gin.Context) {
    var req CreateScheduleRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, ErrorResponse(err))
        return
    }
    
    schedule, err := h.service.Create(c.Request.Context(), req)
    if err != nil {
        c.JSON(500, ErrorResponse(err))
        return
    }
    
    c.JSON(201, SuccessResponse(schedule, "Schedule created successfully"))
}
```

#### 3. Service
```go
// services/schedule_service.go
func (s *ScheduleService) Create(ctx context.Context, req CreateScheduleRequest) (*Schedule, error) {
    // Validate
    if err := s.validator.Validate(req); err != nil {
        return nil, err
    }
    
    // Check permissions
    if err := s.checkPermissions(ctx, req); err != nil {
        return nil, err
    }
    
    // Check conflicts
    if conflict, err := s.repo.CheckConflict(ctx, req); err != nil || conflict {
        return nil, ErrScheduleConflict
    }
    
    // Create
    schedule := s.mapToSchedule(req)
    if err := s.repo.Create(ctx, schedule); err != nil {
        return nil, err
    }
    
    // Send notification (async)
    s.notificationService.SendScheduleCreated(schedule)
    
    return schedule, nil
}
```

#### 4. Repository
```go
// repositories/schedule_repository.go
func (r *ScheduleRepository) Create(ctx context.Context, schedule *Schedule) error {
    query := `
        INSERT INTO schedules (trainee_id, trainer_id, date, time, duration, exercises, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at, updated_at
    `
    
    return r.db.QueryRowContext(
        ctx, query,
        schedule.TraineeID, schedule.TrainerID, schedule.Date,
        schedule.Time, schedule.Duration, schedule.Exercises, schedule.Notes,
    ).Scan(&schedule.ID, &schedule.CreatedAt, &schedule.UpdatedAt)
}
```

#### 5. Tests
```go
// handlers/schedule_handler_test.go
func TestScheduleHandler_Create(t *testing.T) {
    // Setup
    mockService := mocks.NewScheduleService()
    handler := NewScheduleHandler(mockService)
    
    // Mock
    mockService.On("Create", mock.Anything, mock.Anything).
        Return(&models.Schedule{ID: "123"}, nil)
    
    // Execute
    req := httptest.NewRequest("POST", "/schedules", body)
    w := httptest.NewRecorder()
    handler.Create(gin.CreateTestContext(w))
    
    // Assert
    assert.Equal(t, 201, w.Code)
    mockService.AssertExpectations(t)
}
```

---

## Quick Start Commands

### 1. Project Setup
```bash
# Create project
mkdir fitness-api
cd fitness-api
go mod init github.com/yourusername/fitness-api

# Install dependencies
go get -u github.com/gin-gonic/gin
go get -u github.com/lib/pq
go get -u github.com/go-redis/redis/v8
go get -u github.com/golang-jwt/jwt/v5
go get -u github.com/supabase-community/supabase-go
```

### 2. Environment Variables
```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost:5432/fitness_db
REDIS_URL=redis://localhost:6379
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_anon_key
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
PORT=8080
```

### 3. Database Migration
```bash
# Install migrate tool
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Create migration
migrate create -ext sql -dir migrations -seq create_users_table

# Run migration
migrate -database $DATABASE_URL -path migrations up
```

### 4. Run Server
```bash
# Development
go run main.go

# With hot reload
air

# Production
go build -o fitness-api
./fitness-api
```

### 5. Run Tests
```bash
# All tests
go test ./...

# With coverage
go test -cover ./...

# Specific package
go test ./services/...

# Integration tests
go test -tags=integration ./...
```

---

## API Endpoint Summary (Quick Reference)

### 🔐 Authentication (5)
- `GET /auth/google` - Initialize OAuth
- `POST /auth/google/callback` - Handle callback
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/verify` - Verify token

### 👤 Users (5)
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update profile
- `GET /users/:id` - Get user (Trainer)
- `GET /users` - List users (Trainer)
- `GET /users/:id/stats` - Get stats

### 📅 Schedules (6)
- `POST /schedules` - Create (Trainer)
- `GET /schedules` - List
- `GET /schedules/:id` - Get by ID
- `PATCH /schedules/:id` - Update (Trainer)
- `PATCH /schedules/:id/status` - Update status (Trainer)
- `DELETE /schedules/:id` - Delete (Trainer)

### 💪 Workouts (6)
- `POST /workouts` - Create (Trainer)
- `GET /workouts` - List
- `GET /workouts/:id` - Get by ID
- `PATCH /workouts/:id` - Update (Trainer)
- `DELETE /workouts/:id` - Delete (Trainer)
- `GET /workouts/summary` - Get summary

### 🏋️ Exercises (6)
- `POST /exercises` - Create (Trainer)
- `GET /exercises` - List
- `GET /exercises/:id` - Get by ID
- `PATCH /exercises/:id` - Update (Trainer)
- `DELETE /exercises/:id` - Delete (Trainer)
- `GET /exercises/categories` - Get categories

### 📝 Session Cards (5)
- `POST /session-cards` - Create (Trainer)
- `GET /session-cards` - List
- `GET /session-cards/:id` - Get by ID
- `PATCH /session-cards/:id` - Update (Trainer)
- `DELETE /session-cards/:id` - Delete (Trainer)

### 📈 Progress (4)
- `GET /progress/exercises/:name` - Exercise progress
- `GET /progress/body-weight` - Weight progress
- `POST /progress/body-weight` - Add weight (Trainer)
- `GET /progress/overall` - Overall progress

### 🔔 Notifications (6)
- `GET /notifications` - List
- `PATCH /notifications/:id/read` - Mark read
- `PATCH /notifications/read-all` - Mark all read
- `DELETE /notifications/:id` - Delete
- `GET /notifications/settings` - Get settings
- `PATCH /notifications/settings` - Update settings

### 📊 Analytics (3)
- `GET /analytics/dashboard` - Dashboard (Trainer)
- `GET /analytics/trainees/:id/report` - Report (Trainer)
- `GET /analytics/exercises/stats` - Exercise stats (Trainer)

### ⚙️ Settings (2)
- `GET /settings` - Get settings
- `PATCH /settings` - Update settings

### 🧪 Testing (2)
- `GET /health` - Health check
- `GET /info` - API info

---

## 📞 Support & Resources

**Documentation:** 
- API Spec: `/API_SPECIFICATION.md`
- Database Schema: This document (Section 7)
- Flowcharts: `/TRAINEE_DASHBOARD_FLOWCHART.md`
- Exercise Types: `/EXERCISE_TYPES_FINAL.md`

**Contact:**
- Email: dev@fitness-app.com
- Slack: #backend-dev
- GitHub: github.com/fitness-management-system

---

**Created by**: Figma Make AI Assistant  
**Date**: 23 มกราคม 2026  
**Version**: 1.0.0  
**Status**: ✅ Ready for Development

**Next Steps:**
1. ✅ Review this development plan
2. ✅ Set up development environment
3. ✅ Create database schema
4. ✅ Start with Phase 1 (Authentication & Users)
5. ✅ Follow the 8-week timeline

Good luck with the backend development! 🚀
