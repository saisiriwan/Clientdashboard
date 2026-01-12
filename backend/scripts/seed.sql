-- ==========================================
-- Fitness Training Management System
-- Sample Seed Data
-- ==========================================

-- Clean existing data (for development only!)
TRUNCATE TABLE 
    refresh_tokens, achievements, notifications, metrics,
    exercise_sets, session_exercises, exercise_library,
    session_cards, schedules, program_assignments, programs,
    locations, trainees, trainers, users
RESTART IDENTITY CASCADE;

-- ==========================================
-- 1. USERS
-- ==========================================

-- Password: "Password123!" (hashed with bcrypt cost 12)
-- Hash: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ.y

-- Trainers
INSERT INTO users (id, email, password_hash, name, role, phone_number, gender, email_verified, is_active) VALUES
(1, 'trainer1@fitness.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ.y', 'John Smith', 'trainer', '081-234-5678', 'male', TRUE, TRUE),
(2, 'trainer2@fitness.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ.y', 'Sarah Johnson', 'trainer', '081-234-5679', 'female', TRUE, TRUE),
(3, 'trainer3@fitness.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ.y', 'Mike Chen', 'trainer', '081-234-5680', 'male', TRUE, TRUE);

-- Trainees
INSERT INTO users (id, email, password_hash, name, role, phone_number, gender, email_verified, is_active) VALUES
(4, 'trainee1@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ.y', 'ธนวัฒน์ สุขใจ', 'trainee', '092-345-6789', 'male', TRUE, TRUE),
(5, 'trainee2@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ.y', 'น้ำฝน พรหมมา', 'trainee', '092-345-6790', 'female', TRUE, TRUE),
(6, 'trainee3@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ.y', 'สมชาย วิริยะกุล', 'trainee', '092-345-6791', 'male', TRUE, TRUE),
(7, 'trainee4@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ.y', 'วรรณา ศรีสุข', 'trainee', '092-345-6792', 'female', TRUE, TRUE),
(8, 'trainee5@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIvAprzZ.y', 'ปิยะ รักเรียน', 'trainee', '092-345-6793', 'male', TRUE, TRUE);

-- Reset sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ==========================================
-- 2. TRAINERS
-- ==========================================

INSERT INTO trainers (user_id, bio, specialization, certifications, experience_years, rating, total_ratings, total_clients, availability) VALUES
(1, 'Certified personal trainer with 10+ years experience. Specializing in strength training and bodybuilding.', 
 ARRAY['Strength Training', 'Bodybuilding', 'Weight Loss'], 
 ARRAY['NASM-CPT', 'ACE Certified', 'Precision Nutrition Level 1'], 
 10, 4.8, 45, 15, 'available'),

(2, 'Fitness enthusiast and yoga instructor. Passionate about helping clients achieve their health goals.',
 ARRAY['Yoga', 'Flexibility', 'Weight Loss', 'Cardio'],
 ARRAY['RYT-200', 'ACE-CPT', 'TRX Certified'],
 7, 4.9, 38, 12, 'available'),

(3, 'Former athlete turned trainer. Expert in sports conditioning and HIIT training.',
 ARRAY['HIIT', 'Sports Conditioning', 'CrossFit', 'Functional Training'],
 ARRAY['CrossFit Level 2', 'NSCA-CSCS', 'Olympic Weightlifting'],
 5, 4.7, 22, 8, 'available');

-- ==========================================
-- 3. TRAINEES
-- ==========================================

INSERT INTO trainees (user_id, trainer_id, height, weight, goals, fitness_level, total_sessions, completed_sessions, current_streak) VALUES
(4, 1, 175.0, 75.0, ARRAY['เพิ่มกล้ามเนื้อ', 'ลดไขมัน 5%'], 'intermediate', 12, 10, 3),
(5, 1, 165.0, 58.0, ARRAY['ลดน้ำหนัก 5kg', 'เพิ่มความแข็งแรง'], 'beginner', 8, 7, 2),
(6, 2, 172.0, 82.0, ARRAY['ลดน้ำหนัก 10kg', 'เพิ่มความยืดหยุ่น'], 'beginner', 15, 14, 5),
(7, 2, 160.0, 52.0, ARRAY['เพิ่มกล้ามเนื้อ', 'ปรับรูปร่าง'], 'intermediate', 20, 18, 7),
(8, 3, 180.0, 85.0, ARRAY['เพิ่มความแข็งแรง', 'สร้างกล้ามเนื้อ'], 'advanced', 25, 23, 10);

-- ==========================================
-- 4. LOCATIONS
-- ==========================================

INSERT INTO locations (name, address, floor, building, phone_number, opening_hours, operating_days, facilities, is_active) VALUES
('Fitness Hub - Siam Branch', '123 Rama I Road, Pathum Wan, Bangkok', '5th Floor', 'Siam Paragon', '02-123-4567', '06:00-22:00', 
 ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
 ARRAY['Free Weights', 'Cardio Zone', 'Yoga Studio', 'Sauna', 'Locker Rooms'], TRUE),

('Fitness Hub - Sukhumvit Branch', '456 Sukhumvit Road, Khlong Toei, Bangkok', '3rd Floor', 'EmQuartier', '02-234-5678', '05:00-23:00',
 ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
 ARRAY['Free Weights', 'Cardio Zone', 'Boxing Ring', 'Swimming Pool', 'Cafe'], TRUE),

('Fitness Hub - Silom Branch', '789 Silom Road, Bang Rak, Bangkok', '2nd Floor', 'Silom Complex', '02-345-6789', '06:00-21:00',
 ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
 ARRAY['Free Weights', 'Cardio Zone', 'Pilates Studio'], TRUE);

-- ==========================================
-- 5. PROGRAMS
-- ==========================================

INSERT INTO programs (trainer_id, name, description, total_weeks, sessions_per_week, goals, target_fitness_level, status) VALUES
(1, 'Beginner Strength Program', 'Perfect for beginners looking to build foundational strength and muscle.', 
 8, 3, ARRAY['Build muscle', 'Increase strength', 'Learn proper form'], 'beginner', 'active'),

(1, 'Advanced Bodybuilding Program', 'High-intensity program for experienced lifters.', 
 12, 5, ARRAY['Muscle hypertrophy', 'Strength gains', 'Body composition'], 'advanced', 'active'),

(2, 'Weight Loss & Yoga', 'Combination of cardio, strength training, and yoga for sustainable weight loss.',
 10, 4, ARRAY['Lose weight', 'Improve flexibility', 'Reduce stress'], 'beginner', 'active'),

(3, 'HIIT & Conditioning', 'High-intensity interval training for maximum calorie burn and conditioning.',
 6, 4, ARRAY['Fat loss', 'Cardiovascular endurance', 'Athletic performance'], 'intermediate', 'active');

-- ==========================================
-- 6. PROGRAM ASSIGNMENTS
-- ==========================================

INSERT INTO program_assignments (program_id, trainee_id, start_date, end_date, current_week, total_sessions, status) VALUES
(1, 4, '2026-01-01', '2026-02-26', 2, 24, 'active'),
(2, 8, '2025-12-01', '2026-02-23', 6, 60, 'active'),
(3, 5, '2026-01-05', '2026-03-16', 1, 40, 'active'),
(3, 6, '2025-12-15', '2026-02-23', 5, 40, 'active'),
(4, 7, '2026-01-08', '2026-02-19', 1, 24, 'active');

-- ==========================================
-- 7. EXERCISE LIBRARY
-- ==========================================

INSERT INTO exercise_library (name, category, description, muscle_groups, equipment, difficulty, is_public, is_verified) VALUES
('Barbell Squat', 'Strength', 'Compound lower body exercise targeting quads, glutes, and hamstrings.',
 ARRAY['Quadriceps', 'Glutes', 'Hamstrings'], ARRAY['Barbell', 'Squat Rack'], 'intermediate', TRUE, TRUE),

('Bench Press', 'Strength', 'Primary chest exercise using a barbell.',
 ARRAY['Chest', 'Triceps', 'Shoulders'], ARRAY['Barbell', 'Bench'], 'intermediate', TRUE, TRUE),

('Deadlift', 'Strength', 'Full body compound movement.',
 ARRAY['Back', 'Glutes', 'Hamstrings', 'Core'], ARRAY['Barbell'], 'advanced', TRUE, TRUE),

('Pull-up', 'Strength', 'Bodyweight back exercise.',
 ARRAY['Back', 'Biceps', 'Core'], ARRAY['Pull-up Bar'], 'intermediate', TRUE, TRUE),

('Dumbbell Shoulder Press', 'Strength', 'Shoulder development exercise.',
 ARRAY['Shoulders', 'Triceps'], ARRAY['Dumbbells'], 'beginner', TRUE, TRUE),

('Plank', 'Core', 'Isometric core strengthening exercise.',
 ARRAY['Core', 'Shoulders'], ARRAY['None'], 'beginner', TRUE, TRUE),

('Treadmill Running', 'Cardio', 'Cardiovascular endurance training.',
 ARRAY['Cardiovascular'], ARRAY['Treadmill'], 'beginner', TRUE, TRUE),

('Battle Ropes', 'Cardio', 'Full body HIIT exercise.',
 ARRAY['Arms', 'Shoulders', 'Core', 'Cardiovascular'], ARRAY['Battle Ropes'], 'intermediate', TRUE, TRUE);

-- ==========================================
-- 8. SCHEDULES (Past & Future)
-- ==========================================

-- Past schedules (completed)
INSERT INTO schedules (trainer_id, trainee_id, location_id, program_assignment_id, date, time, duration, title, session_type, status) VALUES
(1, 4, 1, 1, '2026-01-06', '09:00', 60, 'Lower Body Strength', 'Strength Training', 'completed'),
(1, 4, 1, 1, '2026-01-08', '09:00', 60, 'Upper Body Push', 'Strength Training', 'completed'),
(2, 5, 2, 3, '2026-01-07', '10:00', 60, 'Cardio & Yoga Session', 'Cardio + Flexibility', 'completed');

-- Upcoming schedules
INSERT INTO schedules (trainer_id, trainee_id, location_id, program_assignment_id, date, time, duration, title, session_type, status) VALUES
(1, 4, 1, 1, CURRENT_DATE + 1, '09:00', 60, 'Upper Body Pull', 'Strength Training', 'scheduled'),
(1, 4, 1, 1, CURRENT_DATE + 3, '09:00', 60, 'Lower Body Hypertrophy', 'Strength Training', 'scheduled'),
(2, 5, 2, 3, CURRENT_DATE + 1, '10:00', 60, 'HIIT & Core', 'HIIT', 'confirmed'),
(2, 6, 2, 4, CURRENT_DATE + 2, '14:00', 60, 'Full Body Yoga', 'Yoga', 'scheduled'),
(3, 8, 3, 2, CURRENT_DATE + 1, '16:00', 90, 'Advanced Strength', 'Strength Training', 'confirmed');

-- ==========================================
-- 9. SESSION CARDS (For completed sessions)
-- ==========================================

INSERT INTO session_cards (schedule_id, trainer_id, trainee_id, date, title, duration, overall_feedback, next_session_goals, trainee_rating, total_exercises, total_sets, total_volume) VALUES
(1, 1, 4, '2026-01-06', 'Lower Body Strength', 60, 
 'Great session! Excellent form on squats. Keep focusing on depth and core engagement.',
 ARRAY['Increase squat weight by 5kg', 'Work on hamstring flexibility'],
 5, 4, 16, 2400.00),

(2, 1, 4, '2026-01-08', 'Upper Body Push', 60,
 'Good progress on bench press. Form is improving. Remember to control the descent.',
 ARRAY['Add 2.5kg to bench press', 'Improve shoulder mobility'],
 5, 5, 20, 1800.00),

(3, 2, 5, '2026-01-07', 'Cardio & Yoga Session', 60,
 'Excellent energy throughout! Flexibility is noticeably improving.',
 ARRAY['Maintain current cardio pace', 'Practice sun salutations at home'],
 5, 3, 12, 0.00);

-- ==========================================
-- 10. SESSION EXERCISES
-- ==========================================

-- Session 1: Lower Body Strength
INSERT INTO session_exercises (session_card_id, exercise_library_id, name, category, exercise_order, notes, total_sets, total_reps, total_weight, total_volume) VALUES
(1, 1, 'Barbell Squat', 'Strength', 1, 'Focus on depth and core engagement', 4, 32, 400.00, 3200.00),
(1, 3, 'Romanian Deadlift', 'Strength', 2, 'Control the eccentric phase', 4, 40, 240.00, 2400.00),
(1, NULL, 'Leg Press', 'Strength', 3, 'Full range of motion', 4, 48, 600.00, 7200.00),
(1, 6, 'Plank', 'Core', 4, 'Hold for 60 seconds each set', 4, 4, 0.00, 0.00);

-- Session 2: Upper Body Push
INSERT INTO session_exercises (session_card_id, exercise_library_id, name, category, exercise_order, notes, total_sets, total_reps, total_weight, total_volume) VALUES
(2, 2, 'Bench Press', 'Strength', 1, 'Control the descent, explosive push', 4, 32, 320.00, 2560.00),
(2, 5, 'Dumbbell Shoulder Press', 'Strength', 2, 'Full range of motion', 4, 40, 200.00, 2000.00),
(2, NULL, 'Dips', 'Strength', 3, 'Bodyweight + 10kg', 4, 36, 140.00, 1260.00),
(2, NULL, 'Cable Flyes', 'Strength', 4, 'Focus on chest squeeze', 4, 48, 120.00, 1440.00),
(2, NULL, 'Tricep Pushdown', 'Strength', 5, 'Keep elbows stable', 4, 48, 80.00, 960.00);

-- ==========================================
-- 11. EXERCISE SETS
-- ==========================================

-- Barbell Squat (Session 1, Exercise 1)
INSERT INTO exercise_sets (session_exercise_id, set_number, reps, weight, completed, rpe) VALUES
(1, 1, 10, 80.0, TRUE, 6),
(1, 2, 10, 100.0, TRUE, 7),
(1, 3, 8, 110.0, TRUE, 8),
(1, 4, 4, 110.0, TRUE, 9);

-- Bench Press (Session 2, Exercise 1)
INSERT INTO exercise_sets (session_exercise_id, set_number, reps, weight, completed, rpe) VALUES
(5, 1, 10, 60.0, TRUE, 5),
(5, 2, 10, 80.0, TRUE, 7),
(5, 3, 8, 90.0, TRUE, 8),
(5, 4, 4, 90.0, TRUE, 9);

-- ==========================================
-- 12. METRICS
-- ==========================================

INSERT INTO metrics (trainee_id, date, type, value, unit, recorded_by) VALUES
-- Trainee 1 (ธนวัฒน์)
(1, '2026-01-01', 'weight', 75.0, 'kg', 4),
(1, '2026-01-05', 'weight', 74.5, 'kg', 4),
(1, '2026-01-10', 'weight', 74.2, 'kg', 4),
(1, '2026-01-01', 'body_fat', 18.5, '%', 1),
(1, '2026-01-10', 'body_fat', 17.8, '%', 1),

-- Trainee 2 (น้ำฝน)
(2, '2026-01-05', 'weight', 58.0, 'kg', 5),
(2, '2026-01-10', 'weight', 57.5, 'kg', 5),

-- Trainee 3 (สมชาย)
(3, '2025-12-15', 'weight', 82.0, 'kg', 6),
(3, '2026-01-01', 'weight', 80.5, 'kg', 6),
(3, '2026-01-10', 'weight', 79.0, 'kg', 6);

-- ==========================================
-- 13. NOTIFICATIONS
-- ==========================================

INSERT INTO notifications (user_id, type, title, message, priority, is_read) VALUES
(4, 'schedule', 'Upcoming Session Tomorrow', 'You have a training session scheduled with John Smith at 09:00 AM', 'high', FALSE),
(5, 'progress', 'Great Progress!', 'You''ve completed 7 sessions this month! Keep it up!', 'medium', FALSE),
(6, 'achievement', 'New Achievement Unlocked!', 'You''ve earned the "5 Day Streak" badge!', 'medium', TRUE),
(7, 'system', 'Membership Expiring Soon', 'Your membership expires in 7 days. Renew now to continue training.', 'high', FALSE);

-- ==========================================
-- 14. ACHIEVEMENTS
-- ==========================================

INSERT INTO achievements (trainee_id, type, title, description, badge_icon, badge_color, value, achieved_at) VALUES
(3, 'streak', '5 Day Streak', 'Completed sessions for 5 consecutive days', '🔥', '#FF6B35', 5, '2026-01-05 10:00:00'),
(4, 'milestone', '10 Sessions Completed', 'Reached your first 10 training sessions!', '🎯', '#002140', 10, '2026-01-08 15:30:00'),
(5, 'pr', 'New Personal Record!', 'New PR on Bench Press: 90kg', '💪', '#FFD700', 90, '2026-01-08 10:15:00');

-- ==========================================
-- Update stats (triggers will handle some, but let's ensure consistency)
-- ==========================================

UPDATE trainees SET
    total_sessions = (SELECT COUNT(*) FROM session_cards WHERE trainee_id = trainees.id),
    completed_sessions = (SELECT COUNT(*) FROM schedules WHERE trainee_id = trainees.id AND status = 'completed'),
    total_workout_hours = (SELECT COALESCE(SUM(duration), 0) / 60.0 FROM session_cards WHERE trainee_id = trainees.id),
    last_session_date = (SELECT MAX(date) FROM session_cards WHERE trainee_id = trainees.id);

UPDATE trainers SET
    total_clients = (SELECT COUNT(*) FROM trainees WHERE trainer_id = trainers.id);

COMMIT;

-- ==========================================
-- Verification Queries
-- ==========================================

-- Check data
SELECT 'Users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'Trainers', COUNT(*) FROM trainers
UNION ALL
SELECT 'Trainees', COUNT(*) FROM trainees
UNION ALL
SELECT 'Locations', COUNT(*) FROM locations
UNION ALL
SELECT 'Programs', COUNT(*) FROM programs
UNION ALL
SELECT 'Program Assignments', COUNT(*) FROM program_assignments
UNION ALL
SELECT 'Schedules', COUNT(*) FROM schedules
UNION ALL
SELECT 'Session Cards', COUNT(*) FROM session_cards
UNION ALL
SELECT 'Exercise Library', COUNT(*) FROM exercise_library
UNION ALL
SELECT 'Session Exercises', COUNT(*) FROM session_exercises
UNION ALL
SELECT 'Exercise Sets', COUNT(*) FROM exercise_sets
UNION ALL
SELECT 'Metrics', COUNT(*) FROM metrics
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Achievements', COUNT(*) FROM achievements;
