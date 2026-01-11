-- ==========================================
-- MIGRATION SQL
-- เพิ่ม/แก้ไข Tables และ Fields ที่ขาด
-- เพื่อรองรับ API สำหรับระบบจัดการการฝึกออกกำลังกาย (Read-Only for Trainee)
-- ==========================================

-- ==========================================
-- PHASE 1: CRITICAL CHANGES
-- ==========================================

-- ========================================
-- 1. CREATE NOTIFICATIONS TABLE (Critical)
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('schedule', 'progress', 'achievement', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id INTEGER,
    related_type VARCHAR(50),  -- 'schedule', 'session_card', 'metric', 'program', etc.
    action_url TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS 'การแจ้งเตือนต่างๆ สำหรับ user (schedule, progress, achievement, system)';


-- ========================================
-- 2. ADD FIELDS TO CLIENTS TABLE
-- ========================================
-- Membership fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS membership_status VARCHAR(50) DEFAULT 'active' CHECK (membership_status IN ('active', 'inactive', 'expired', 'suspended'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS membership_start_date TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS membership_end_date TIMESTAMP;

-- Additional profile fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS fitness_level VARCHAR(50) CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS current_weight FLOAT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS allergies TEXT;

COMMENT ON COLUMN clients.membership_status IS 'สถานะการเป็นสมาชิก';
COMMENT ON COLUMN clients.membership_start_date IS 'วันที่เริ่มสมาชิก';
COMMENT ON COLUMN clients.membership_end_date IS 'วันที่สิ้นสุดสมาชิก';
COMMENT ON COLUMN clients.fitness_level IS 'ระดับความสามารถในการออกกำลังกาย';


-- ========================================
-- 3. ADD FIELDS TO SCHEDULES TABLE
-- ========================================
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS duration INTEGER;  -- minutes
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS session_type VARCHAR(50) DEFAULT 'personal_training' CHECK (session_type IN ('personal_training', 'group_training', 'assessment', 'consultation'));
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS planned_exercises TEXT[];  -- array of exercise names

COMMENT ON COLUMN schedules.description IS 'รายละเอียดของเซสชัน';
COMMENT ON COLUMN schedules.duration IS 'ระยะเวลาเซสชัน (นาที)';
COMMENT ON COLUMN schedules.session_type IS 'ประเภทเซสชัน';
COMMENT ON COLUMN schedules.notes IS 'หมายเหตุสำหรับเซสชัน';
COMMENT ON COLUMN schedules.planned_exercises IS 'ท่าออกกำลังกายที่วางแผนไว้';


-- ========================================
-- 4. ADD FIELDS TO PROGRAMS TABLE
-- ========================================
ALTER TABLE programs ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled'));
ALTER TABLE programs ADD COLUMN IF NOT EXISTS current_week INTEGER DEFAULT 1;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS sessions_completed INTEGER DEFAULT 0;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS total_sessions INTEGER;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS goals TEXT[];  -- array of goals
ALTER TABLE programs ADD COLUMN IF NOT EXISTS weekly_schedule JSONB;  -- เก็บตารางเวลาสัปดาห์

-- Create index for program status
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_client_id ON programs(client_id);

COMMENT ON COLUMN programs.start_date IS 'วันที่เริ่มโปรแกรม';
COMMENT ON COLUMN programs.end_date IS 'วันที่สิ้นสุดโปรแกรม';
COMMENT ON COLUMN programs.status IS 'สถานะโปรแกรม';
COMMENT ON COLUMN programs.current_week IS 'สัปดาห์ปัจจุบัน';
COMMENT ON COLUMN programs.sessions_completed IS 'จำนวนเซสชันที่ทำเสร็จแล้ว';
COMMENT ON COLUMN programs.total_sessions IS 'จำนวนเซสชันทั้งหมด';
COMMENT ON COLUMN programs.goals IS 'เป้าหมายของโปรแกรม';
COMMENT ON COLUMN programs.weekly_schedule IS 'ตารางเวลาการฝึกแต่ละสัปดาห์';


-- ==========================================
-- PHASE 2: IMPORTANT CHANGES
-- ==========================================

-- ========================================
-- 5. CREATE CLIENT_METRICS_V2 TABLE (Wide Table - Better Performance)
-- ========================================
CREATE TABLE IF NOT EXISTS client_metrics_v2 (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    weight FLOAT,
    bmi FLOAT,
    body_fat FLOAT,
    muscle_mass FLOAT,
    body_water FLOAT,
    visceral_fat INTEGER,
    bone_mass FLOAT,
    bmr INTEGER,  -- Basal Metabolic Rate
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for client_metrics_v2
CREATE INDEX IF NOT EXISTS idx_client_metrics_v2_client_date ON client_metrics_v2(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_client_metrics_v2_date ON client_metrics_v2(date DESC);

COMMENT ON TABLE client_metrics_v2 IS 'ข้อมูลการวัดค่าต่างๆ ของลูกเทรน (Wide Table Format - แนะนำใช้แทน client_metrics)';
COMMENT ON COLUMN client_metrics_v2.weight IS 'น้ำหนัก (kg)';
COMMENT ON COLUMN client_metrics_v2.bmi IS 'ค่า Body Mass Index';
COMMENT ON COLUMN client_metrics_v2.body_fat IS 'เปอร์เซ็นต์ไขมัน (%)';
COMMENT ON COLUMN client_metrics_v2.muscle_mass IS 'มวลกล้ามเนื้อ (kg)';
COMMENT ON COLUMN client_metrics_v2.body_water IS 'เปอร์เซ็นต์น้ำในร่างกาย (%)';
COMMENT ON COLUMN client_metrics_v2.visceral_fat IS 'ระดับไขมันอวัยวะภายใน';
COMMENT ON COLUMN client_metrics_v2.bone_mass IS 'มวลกระดูก (kg)';
COMMENT ON COLUMN client_metrics_v2.bmr IS 'อัตราการเผาผลาญพื้นฐาน (calories/day)';


-- ========================================
-- 6. ADD FIELDS TO SESSION_LOGS TABLE
-- ========================================
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS overall_notes TEXT;
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS next_goals TEXT[];
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS mood VARCHAR(50) CHECK (mood IN ('excellent', 'good', 'neutral', 'tired', 'exhausted'));
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5);
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS total_volume FLOAT;  -- kg (คำนวณได้จาก sets)
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS calories_burned INTEGER;  -- estimated
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS muscle_groups TEXT[];
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS attachments JSONB;  -- array of file URLs
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS title VARCHAR(255);  -- ชื่อเซสชัน
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS trainer_id INTEGER REFERENCES users(id);
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS date TIMESTAMP;
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS duration INTEGER;  -- minutes
ALTER TABLE session_logs ADD COLUMN IF NOT EXISTS rating FLOAT CHECK (rating >= 0 AND rating <= 5);

COMMENT ON COLUMN session_logs.overall_notes IS 'ความเห็นโดยรวมจากเทรนเนอร์';
COMMENT ON COLUMN session_logs.next_goals IS 'เป้าหมายครั้งหน้า';
COMMENT ON COLUMN session_logs.mood IS 'อารมณ์ของลูกเทรนระหว่างฝึก';
COMMENT ON COLUMN session_logs.energy_level IS 'ระดับพลังงาน (1-5)';
COMMENT ON COLUMN session_logs.total_volume IS 'น้ำหนักรวมที่ยก (kg)';
COMMENT ON COLUMN session_logs.calories_burned IS 'แคลอรี่ที่เผาผลาญโดยประมาณ';
COMMENT ON COLUMN session_logs.muscle_groups IS 'กลุ่มกล้ามเนื้อที่ฝึก';
COMMENT ON COLUMN session_logs.tags IS 'แท็กสำหรับจัดหมวดหมู่';
COMMENT ON COLUMN session_logs.title IS 'ชื่อเซสชัน (เช่น Upper Body Strength)';


-- ========================================
-- 7. ADD FIELDS TO SESSION_LOG_SETS TABLE
-- ========================================
ALTER TABLE session_log_sets ADD COLUMN IF NOT EXISTS is_pr BOOLEAN DEFAULT FALSE;
ALTER TABLE session_log_sets ADD COLUMN IF NOT EXISTS previous_best_weight FLOAT;
ALTER TABLE session_log_sets ADD COLUMN IF NOT EXISTS previous_best_date TIMESTAMP;
ALTER TABLE session_log_sets ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE session_log_sets ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE session_log_sets ADD COLUMN IF NOT EXISTS rest_time INTEGER;  -- seconds

COMMENT ON COLUMN session_log_sets.is_pr IS 'เป็น Personal Record หรือไม่';
COMMENT ON COLUMN session_log_sets.previous_best_weight IS 'น้ำหนักสถิติส่วนตัวก่อนหน้า';
COMMENT ON COLUMN session_log_sets.previous_best_date IS 'วันที่ทำสถิติส่วนตัวก่อนหน้า';
COMMENT ON COLUMN session_log_sets.video_url IS 'URL วิดีโอบันทึกการฝึก';
COMMENT ON COLUMN session_log_sets.rest_time IS 'เวลาพัก (วินาที)';


-- ========================================
-- 8. ADD FIELDS TO TRAINERS TABLE
-- ========================================
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS rating FLOAT DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5);
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS total_clients INTEGER DEFAULT 0;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS active_clients INTEGER DEFAULT 0;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS success_stories INTEGER DEFAULT 0;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS available_days TEXT[];  -- ['Monday', 'Wednesday', 'Friday']
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS available_time_slots TEXT[];  -- ['09:00-12:00', '14:00-18:00']
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS social_media JSONB;  -- {instagram: '@coach', facebook: 'coach.page'}
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['Thai'];
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN trainers.cover_image IS 'รูปปกโปรไฟล์';
COMMENT ON COLUMN trainers.rating IS 'คะแนนเฉลี่ยจาก reviews (0-5)';
COMMENT ON COLUMN trainers.total_clients IS 'จำนวนลูกค้าทั้งหมด';
COMMENT ON COLUMN trainers.active_clients IS 'จำนวนลูกค้าที่กำลังใช้งาน';
COMMENT ON COLUMN trainers.total_sessions IS 'จำนวนเซสชันทั้งหมดที่สอน';
COMMENT ON COLUMN trainers.success_stories IS 'จำนวนเรื่องราวความสำเร็จ';
COMMENT ON COLUMN trainers.available_days IS 'วันที่ว่าง';
COMMENT ON COLUMN trainers.available_time_slots IS 'ช่วงเวลาที่ว่าง';
COMMENT ON COLUMN trainers.social_media IS 'ข้อมูล social media';
COMMENT ON COLUMN trainers.languages IS 'ภาษาที่พูดได้';
COMMENT ON COLUMN trainers.is_active IS 'สถานะการทำงาน';


-- ========================================
-- 9. ADD FIELDS TO USERS TABLE
-- ========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

COMMENT ON COLUMN users.google_id IS 'Google Account ID สำหรับ OAuth login';
COMMENT ON COLUMN users.profile_image IS 'URL รูปโปรไฟล์';
COMMENT ON COLUMN users.last_login IS 'เวลา login ครั้งสุดท้าย';


-- ==========================================
-- PHASE 3: OPTIONAL TABLES (NICE TO HAVE)
-- ==========================================

-- ========================================
-- 10. CREATE ACHIEVEMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    badge VARCHAR(50),  -- emoji หรือ icon name
    type VARCHAR(50) CHECK (type IN ('pr', 'streak', 'milestone', 'consistency', 'weight_loss', 'strength_gain')),
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_id INTEGER,
    related_type VARCHAR(50),  -- 'session_log', 'program', 'metric'
    metadata JSONB  -- เก็บข้อมูลเพิ่มเติม เช่น { "weight": 60, "exercise": "Bench Press" }
);

-- Create indexes for achievements
CREATE INDEX IF NOT EXISTS idx_achievements_client_id ON achievements(client_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(type);
CREATE INDEX IF NOT EXISTS idx_achievements_achieved_at ON achievements(achieved_at DESC);

COMMENT ON TABLE achievements IS 'ความสำเร็จและรางวัลต่างๆ ของลูกเทรน';
COMMENT ON COLUMN achievements.badge IS 'ไอคอนหรืออีโมจิสำหรับแสดง (เช่น 🏆, 🔥, 💪)';
COMMENT ON COLUMN achievements.metadata IS 'ข้อมูลเพิ่มเติมในรูปแบบ JSON';


-- ========================================
-- 11. CREATE TRAINER_REVIEWS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS trainer_reviews (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for trainer_reviews
CREATE INDEX IF NOT EXISTS idx_trainer_reviews_trainer_id ON trainer_reviews(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_reviews_rating ON trainer_reviews(rating);

COMMENT ON TABLE trainer_reviews IS 'รีวิวและคะแนนของเทรนเนอร์จากลูกเทรน';


-- ========================================
-- 12. CREATE PROGRAM_PROGRESS_NOTES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS program_progress_notes (
    id SERIAL PRIMARY KEY,
    program_id INTEGER REFERENCES programs(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT NOT NULL,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for program_progress_notes
CREATE INDEX IF NOT EXISTS idx_program_progress_notes_program_id ON program_progress_notes(program_id);

COMMENT ON TABLE program_progress_notes IS 'บันทึกความคืบหน้าของโปรแกรมแต่ละสัปดาห์';


-- ==========================================
-- DATA MIGRATION & UPDATES
-- ==========================================

-- ========================================
-- Update existing data in clients table
-- ========================================
UPDATE clients SET 
    membership_status = 'active',
    membership_start_date = join_date,
    membership_end_date = join_date + INTERVAL '1 year',
    fitness_level = CASE 
        WHEN id = 1 THEN 'beginner'
        WHEN id = 2 THEN 'intermediate'
        ELSE 'intermediate'
    END,
    current_weight = weight_kg
WHERE membership_status IS NULL;


-- ========================================
-- Update existing data in programs table
-- ========================================
UPDATE programs SET 
    start_date = created_at,
    end_date = created_at + (duration_weeks || ' weeks')::INTERVAL,
    total_sessions = duration_weeks * days_per_week,
    status = 'active',
    goals = ARRAY['เพิ่มความแข็งแรง', 'พัฒนารูปร่าง', 'สร้างนิสัยการออกกำลังกาย']
WHERE start_date IS NULL;


-- ========================================
-- Update existing data in schedules table
-- ========================================
UPDATE schedules SET 
    duration = 60,
    session_type = 'personal_training',
    description = 'เซสชันการฝึกส่วนตัวกับเทรนเนอร์'
WHERE duration IS NULL;


-- ========================================
-- Update existing data in trainers table
-- ========================================
UPDATE trainers SET 
    rating = 4.8,
    total_clients = 45,
    active_clients = 28,
    total_sessions = 1250,
    success_stories = 38,
    available_days = ARRAY['Monday', 'Wednesday', 'Friday', 'Saturday'],
    available_time_slots = ARRAY['09:00-12:00', '14:00-18:00'],
    languages = ARRAY['Thai', 'English'],
    is_active = TRUE
WHERE rating IS NULL OR rating = 0;


-- ==========================================
-- INSERT MOCK DATA FOR NEW TABLES
-- ==========================================

-- ========================================
-- Mock Data: Notifications
-- ========================================
INSERT INTO notifications (user_id, type, title, message, related_id, related_type, action_url, priority, is_read) VALUES
(2, 'schedule', 'อย่าลืม! เซสชันการฝึกวันนี้', 'คุณมีนัดฝึกกับโค้ชบเนศ วันนี้เวลา 14:00 น. ที่ห้องฟิตเนส A', 1, 'schedule', '/schedule/1', 'high', FALSE),
(2, 'achievement', 'ยินดีด้วย! คุณทำ PR ใหม่', 'คุณทำ Personal Record ใหม่ใน Bench Press ที่ 60kg', 1, 'session_log', '/session-cards/1', 'medium', FALSE),
(2, 'progress', 'อัพเดทความก้าวหน้า', 'โค้ชบเนศได้บันทึกผลการวัดน้ำหนักของคุณแล้ว', 1, 'metric', '/progress', 'low', TRUE),
(2, 'system', 'ยินดีต้อนรับสู่ระบบ', 'ยินดีต้อนรับคุณสมชายเข้าสู่ระบบการฝึกออกกำลังกาย', NULL, NULL, NULL, 'medium', TRUE);


-- ========================================
-- Mock Data: Client Metrics V2
-- ========================================
INSERT INTO client_metrics_v2 (client_id, date, weight, bmi, body_fat, muscle_mass, body_water, visceral_fat, bone_mass, bmr, notes, recorded_by) VALUES
-- Client 1 (Somchai) - ข้อมูล 6 สัปดาห์
(1, '2026-01-10', 72.5, 23.7, 18.5, 58.2, 55.0, 8, 3.2, 1650, 'รู้สึกดีขึ้นมาก พลังงานเพิ่มขึ้น', 1),
(1, '2026-01-03', 73.0, 23.9, 19.0, 57.8, 54.5, 9, 3.2, 1645, NULL, 1),
(1, '2025-12-27', 73.5, 24.1, 19.5, 57.4, 54.0, 9, 3.2, 1640, 'ลดน้ำหนักได้ดีตามแผน', 1),
(1, '2025-12-20', 74.0, 24.2, 20.0, 57.0, 53.5, 9, 3.2, 1635, NULL, 1),
(1, '2025-12-13', 74.2, 24.3, 20.3, 56.8, 53.2, 10, 3.2, 1632, NULL, 1),
(1, '2025-12-06', 74.5, 24.4, 20.5, 56.5, 53.0, 10, 3.2, 1630, 'เริ่มโปรแกรมลดน้ำหนัก', 1),

-- Client 2 (Malee) - ข้อมูล 6 สัปดาห์
(2, '2026-01-10', 56.5, 21.8, 17.2, 29.5, 56.0, 5, 2.5, 1280, 'กล้ามเนื้อเพิ่มขึ้นดีมาก', 1),
(2, '2026-01-03', 56.2, 21.7, 17.5, 29.2, 55.8, 5, 2.5, 1275, NULL, 1),
(2, '2025-12-27', 56.0, 21.6, 17.8, 29.0, 55.5, 6, 2.5, 1270, NULL, 1),
(2, '2025-12-20', 55.8, 21.5, 18.0, 28.8, 55.2, 6, 2.5, 1265, 'ความแข็งแรงดีขึ้นเห็นได้ชัด', 1),
(2, '2025-12-13', 55.5, 21.4, 18.2, 28.5, 55.0, 6, 2.5, 1260, NULL, 1),
(2, '2025-12-06', 55.0, 21.2, 18.5, 28.0, 54.5, 6, 2.5, 1250, 'เริ่มโปรแกรมเพิ่มกล้ามเนื้อ', 1);


-- ========================================
-- Mock Data: Achievements
-- ========================================
INSERT INTO achievements (client_id, title, description, badge, type, achieved_at, related_id, related_type, metadata) VALUES
(1, 'ทำ PR ใหม่ใน Bench Press', 'ยกน้ำหนักได้ 60kg เป็นครั้งแรก!', '🏆', 'pr', '2026-01-09 15:30:00', 1, 'session_log', '{"exercise": "Bench Press", "weight": 60, "previous": 57.5}'::jsonb),
(1, 'เข้าฝึก 5 วันติดต่อกัน', 'ความมุ่งมั่นที่ยอดเยี่ยม!', '🔥', 'streak', '2026-01-08 18:00:00', NULL, NULL, '{"streak_days": 5}'::jsonb),
(1, 'ลดน้ำหนักได้ 2 กิโล', 'ใกล้เป้าหมายแล้ว!', '⭐', 'weight_loss', '2026-01-10 09:00:00', 1, 'metric', '{"weight_lost": 2.0, "target": 5.0}'::jsonb),
(2, 'ทำ PR ใหม่ใน Squat', 'ยกน้ำหนักได้ 70kg!', '🏆', 'pr', '2026-01-07 11:00:00', 2, 'session_log', '{"exercise": "Squat", "weight": 70, "previous": 65}'::jsonb),
(2, 'เพิ่มกล้ามเนื้อได้ 1.5 กิโล', 'กล้ามเนื้อเพิ่มขึ้นตามเป้าหมาย!', '💪', 'strength_gain', '2026-01-10 09:00:00', 2, 'metric', '{"muscle_gained": 1.5}'::jsonb);


-- ========================================
-- Mock Data: Trainer Reviews
-- ========================================
INSERT INTO trainer_reviews (trainer_id, client_id, rating, comment) VALUES
(1, 1, 5, 'โค้ชสอนดีมาก ใส่ใจ แนะนำเทคนิคดีๆ เยอะ ผลลัพธ์ชัดเจน'),
(1, 2, 5, 'โค้ชเข้าใจปัญหาและออกแบบโปรแกรมที่เหมาะกับเรามาก ชอบมากครับ'),
(1, 3, 4, 'โค้ชดีมาก แต่บางทีตารางเวลาไม่ค่อยตรงกัน');


-- ========================================
-- Mock Data: Program Progress Notes
-- ========================================
INSERT INTO program_progress_notes (program_id, week_number, date, note, recorded_by) VALUES
(1, 1, '2024-01-08', 'สัปดาห์แรกเริ่มต้นดี ลูกเทรนตั้งใจฝึก ฟอร์มยังต้องแก้ไขอีกเล็กน้อย', 1),
(1, 2, '2024-01-15', 'สัปดาห์ที่ 2 ฟอร์มดีขึ้นมาก เริ่มเห็นความก้าวหน้า', 1),
(1, 3, '2024-01-22', 'สัปดาห์ที่ 3 ความแข็งแรงเพิ่มขึ้นเห็นได้ชัด พร้อมเพิ่มน้ำหนักในสัปดาห์หน้า', 1),
(1, 4, '2026-01-10', 'สัปดาห์ที่ 4 ความแข็งแรงดีขึ้นเห็นได้ชัด พร้อมเพิ่มน้ำหนักในสัปดาห์หน้า', 1),
(2, 1, '2024-02-08', 'สัปดาห์แรกของโปรแกรมเพิ่มกล้ามเนื้อ ลูกเทรนมีพื้นฐานดีอยู่แล้ว', 1),
(2, 2, '2024-02-15', 'สัปดาห์ที่ 2 เริ่มเห็นการเพิ่มขึ้นของกล้ามเนื้อ ควบคุมอาหารดี', 1);


-- ==========================================
-- CREATE VIEWS FOR EASIER QUERYING
-- ==========================================

-- ========================================
-- View: Trainee Full Profile
-- ========================================
CREATE OR REPLACE VIEW v_trainee_full_profile AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone_number,
    c.avatar_url,
    c.birth_date,
    c.gender,
    c.height_cm,
    c.current_weight,
    c.weight_kg as initial_weight,
    c.target_weight,
    c.goal,
    c.injuries,
    c.medical_conditions,
    c.fitness_level,
    c.membership_status,
    c.membership_start_date,
    c.membership_end_date,
    c.join_date,
    -- Assigned Trainer Info
    t.id as trainer_id,
    u.name as trainer_name,
    u.email as trainer_email,
    u.phone_number as trainer_phone,
    t.avatar_url as trainer_avatar,
    t.specialization as trainer_specialization,
    -- User Account Info
    u2.id as user_id,
    u2.email as user_email,
    u2.profile_image,
    c.created_at,
    c.updated_at
FROM clients c
LEFT JOIN users u ON c.trainer_id = u.id
LEFT JOIN trainers t ON u.id = t.user_id
LEFT JOIN users u2 ON c.user_id = u2.id;

COMMENT ON VIEW v_trainee_full_profile IS 'View รวมข้อมูลโปรไฟล์ของลูกเทรนพร้อมข้อมูลเทรนเนอร์';


-- ========================================
-- View: Upcoming Schedules (7 days)
-- ========================================
CREATE OR REPLACE VIEW v_upcoming_schedules AS
SELECT 
    s.id,
    s.title,
    s.start_time,
    s.end_time,
    s.duration,
    s.location,
    s.status,
    s.session_type,
    s.description,
    s.notes,
    -- Client Info
    c.id as client_id,
    c.name as client_name,
    c.avatar_url as client_avatar,
    -- Trainer Info
    t.id as trainer_id,
    u.name as trainer_name,
    t.avatar_url as trainer_avatar,
    u.phone_number as trainer_phone
FROM schedules s
LEFT JOIN clients c ON s.client_id = c.id
LEFT JOIN users u ON s.trainer_id = u.id
LEFT JOIN trainers t ON u.id = t.user_id
WHERE s.start_time >= CURRENT_TIMESTAMP
  AND s.start_time <= CURRENT_TIMESTAMP + INTERVAL '7 days'
  AND s.status IN ('scheduled', 'confirmed')
ORDER BY s.start_time ASC;

COMMENT ON VIEW v_upcoming_schedules IS 'View แสดงตารางนัดหมาย 7 วันข้างหน้า';


-- ========================================
-- View: Session Cards with Details
-- ========================================
CREATE OR REPLACE VIEW v_session_cards AS
SELECT 
    sl.id,
    sl.title,
    sl.date,
    sl.duration,
    sl.rating,
    sl.overall_notes,
    sl.next_goals,
    sl.mood,
    sl.energy_level,
    sl.total_volume,
    sl.calories_burned,
    sl.muscle_groups,
    sl.tags,
    -- Schedule Info
    s.id as schedule_id,
    s.location,
    -- Trainer Info
    t.id as trainer_id,
    u.name as trainer_name,
    t.avatar_url as trainer_avatar,
    u.phone_number as trainer_phone,
    -- Exercise Count
    COUNT(DISTINCT sl2.exercise_id) as exercise_count,
    -- PR Count
    SUM(CASE WHEN sls.is_pr THEN 1 ELSE 0 END) as pr_count,
    sl.created_at,
    sl.updated_at
FROM session_logs sl
LEFT JOIN schedules s ON sl.schedule_id = s.id
LEFT JOIN users u ON sl.trainer_id = u.id
LEFT JOIN trainers t ON u.id = t.user_id
LEFT JOIN session_logs sl2 ON sl.id = sl2.id
LEFT JOIN session_log_sets sls ON sl2.id = sls.session_log_id
WHERE sl.status = 'completed'
GROUP BY sl.id, s.id, t.id, u.id
ORDER BY sl.date DESC;

COMMENT ON VIEW v_session_cards IS 'View แสดง Session Cards พร้อมรายละเอียดสรุป';


-- ==========================================
-- FUNCTIONS FOR CALCULATIONS
-- ==========================================

-- ========================================
-- Function: Calculate BMI
-- ========================================
CREATE OR REPLACE FUNCTION calculate_bmi(weight_kg FLOAT, height_cm FLOAT)
RETURNS FLOAT AS $$
BEGIN
    IF height_cm IS NULL OR height_cm = 0 THEN
        RETURN NULL;
    END IF;
    RETURN ROUND((weight_kg / POWER(height_cm / 100, 2))::numeric, 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_bmi IS 'คำนวณค่า BMI จากน้ำหนัก (kg) และส่วนสูง (cm)';


-- ========================================
-- Function: Get Unread Notification Count
-- ========================================
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM notifications
        WHERE user_id = p_user_id
          AND is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_unread_notification_count IS 'นับจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน';


-- ========================================
-- Function: Get Current Program for Client
-- ========================================
CREATE OR REPLACE FUNCTION get_current_program(p_client_id INTEGER)
RETURNS TABLE (
    program_id INTEGER,
    program_name VARCHAR,
    status VARCHAR,
    progress_percentage FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.status,
        CASE 
            WHEN p.total_sessions > 0 THEN 
                ROUND((p.sessions_completed::FLOAT / p.total_sessions * 100)::numeric, 1)
            ELSE 0
        END as progress_percentage
    FROM programs p
    WHERE p.client_id = p_client_id
      AND p.status = 'active'
    ORDER BY p.start_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_current_program IS 'ดึงโปรแกรมปัจจุบันของลูกเทรน';


-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_schedules_client_id_start_time ON schedules(client_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_schedules_status_start_time ON schedules(status, start_time);
CREATE INDEX IF NOT EXISTS idx_session_logs_date ON session_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_session_logs_schedule_id ON session_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_client_metrics_client_id_date ON client_metrics(client_id, date DESC);


-- ==========================================
-- MIGRATION COMPLETED
-- ==========================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '📊 New tables created: notifications, client_metrics_v2, achievements, trainer_reviews, program_progress_notes';
    RAISE NOTICE '🔧 Tables updated: users, clients, schedules, programs, session_logs, session_log_sets, trainers';
    RAISE NOTICE '👁️ Views created: v_trainee_full_profile, v_upcoming_schedules, v_session_cards';
    RAISE NOTICE '⚡ Functions created: calculate_bmi, get_unread_notification_count, get_current_program';
END $$;
