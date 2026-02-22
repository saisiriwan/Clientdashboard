-- =====================================================
-- Seed: 002 - Seed demo data for testing
-- Description: Sample users, schedules, workouts, etc.
-- Created: 2026-01-24
-- =====================================================

-- =====================================================
-- DEMO USERS
-- =====================================================

-- Insert Trainers
INSERT INTO users (id, email, name, avatar, role, phone, gender, is_active, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'trainer1@fitness.com', 'Coach John Smith', 'https://i.pravatar.cc/150?img=12', 'trainer', '+66812345678', 'male', true, '2025-01-01 00:00:00'),
('00000000-0000-0000-0000-000000000002', 'trainer2@fitness.com', 'Coach Sarah Johnson', 'https://i.pravatar.cc/150?img=45', 'trainer', '+66898765432', 'female', true, '2025-01-01 00:00:00');

-- Insert Trainees
INSERT INTO users (id, email, name, avatar, role, phone, date_of_birth, gender, height, weight, is_active, created_at) VALUES
('00000000-0000-0000-0000-000000000011', 'trainee1@example.com', 'Jane Doe', 'https://i.pravatar.cc/150?img=20', 'trainee', '+66823456789', '1995-05-15', 'female', 165.0, 58.5, true, '2025-01-05 00:00:00'),
('00000000-0000-0000-0000-000000000012', 'trainee2@example.com', 'Michael Chen', 'https://i.pravatar.cc/150?img=33', 'trainee', '+66834567890', '1992-08-22', 'male', 178.0, 75.2, true, '2025-01-06 00:00:00'),
('00000000-0000-0000-0000-000000000013', 'trainee3@example.com', 'Emily Brown', 'https://i.pravatar.cc/150?img=47', 'trainee', '+66845678901', '1998-03-10', 'female', 162.0, 54.0, true, '2025-01-10 00:00:00');

-- =====================================================
-- SETTINGS for each user
-- =====================================================

INSERT INTO settings (user_id, theme, language, weight_unit, distance_unit) VALUES
('00000000-0000-0000-0000-000000000001', 'dark', 'th', 'kg', 'km'),
('00000000-0000-0000-0000-000000000002', 'light', 'th', 'kg', 'km'),
('00000000-0000-0000-0000-000000000011', 'dark', 'th', 'kg', 'km'),
('00000000-0000-0000-0000-000000000012', 'light', 'en', 'kg', 'km'),
('00000000-0000-0000-0000-000000000013', 'auto', 'th', 'kg', 'km');

-- =====================================================
-- SCHEDULES
-- =====================================================

-- Past schedules (completed)
INSERT INTO schedules (trainee_id, trainer_id, title, date, start_time, end_time, duration, location, status, notes, created_at) VALUES
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Strength Training Session', '2026-01-10', '14:00', '15:00', 60, 'Gym Room A', 'completed', 'Focus on lower body', '2026-01-05 10:00:00'),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Upper Body Workout', '2026-01-13', '14:00', '15:30', 90, 'Gym Room A', 'completed', 'Chest and back focus', '2026-01-08 10:00:00'),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Full Body + Cardio', '2026-01-17', '14:00', '15:15', 75, 'Gym Room A', 'completed', 'Mixed session', '2026-01-12 10:00:00');

-- Today's schedule
INSERT INTO schedules (trainee_id, trainer_id, title, date, start_time, end_time, duration, location, status, notes, created_at) VALUES
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Strength Training', CURRENT_DATE, '14:00', '15:00', 60, 'Gym Room A', 'confirmed', 'Focus on upper body', CURRENT_TIMESTAMP);

-- Upcoming schedules
INSERT INTO schedules (trainee_id, trainer_id, title, date, start_time, end_time, duration, location, status, notes, created_at) VALUES
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Cardio Session', CURRENT_DATE + INTERVAL '2 days', '10:00', '10:45', 45, 'Track Field', 'confirmed', 'Running and cycling', CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Flexibility & Recovery', CURRENT_DATE + INTERVAL '4 days', '16:30', '17:00', 30, 'Yoga Room', 'confirmed', 'Stretching and foam rolling', CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Strength Assessment', CURRENT_DATE + INTERVAL '1 day', '15:00', '16:00', 60, 'Gym Room B', 'pending', 'Initial assessment', CURRENT_TIMESTAMP);

-- =====================================================
-- WORKOUTS
-- =====================================================

-- Workout 1: Weight Training (2026-01-10)
INSERT INTO workouts (trainee_id, trainer_id, date, duration, exercises, summary, notes, rating, mood, created_at) VALUES
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '2026-01-10', 60,
'[
  {
    "name": "Squat",
    "type": "weight_training",
    "isBodyweight": false,
    "sets": [
      {"setNumber": 1, "weight": 70, "reps": 8, "rest": 90},
      {"setNumber": 2, "weight": 70, "reps": 8, "rest": 90},
      {"setNumber": 3, "weight": 70, "reps": 8, "rest": 90},
      {"setNumber": 4, "weight": 70, "reps": 7, "rest": 90}
    ]
  },
  {
    "name": "Leg Press",
    "type": "weight_training",
    "isBodyweight": false,
    "sets": [
      {"setNumber": 1, "weight": 100, "reps": 10, "rest": 60},
      {"setNumber": 2, "weight": 100, "reps": 10, "rest": 60},
      {"setNumber": 3, "weight": 100, "reps": 9, "rest": 60}
    ]
  }
]'::jsonb,
'{
  "totalSets": 7,
  "totalReps": 61,
  "totalWeight": 4900,
  "totalDistance": 0,
  "totalDuration": 0,
  "totalCalories": 0,
  "exerciseCount": 2,
  "typeBreakdown": {
    "weight_training": 2,
    "cardio": 0,
    "flexibility": 0
  }
}'::jsonb,
'Great form on squats! Keep it up.',
5,
'energetic',
'2026-01-10 15:15:00'
);

-- Workout 2: Upper Body (2026-01-13)
INSERT INTO workouts (trainee_id, trainer_id, date, duration, exercises, summary, notes, rating, mood, created_at) VALUES
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '2026-01-13', 90,
'[
  {
    "name": "Bench Press",
    "type": "weight_training",
    "isBodyweight": false,
    "sets": [
      {"setNumber": 1, "weight": 40, "reps": 10, "rest": 120},
      {"setNumber": 2, "weight": 45, "reps": 8, "rest": 120},
      {"setNumber": 3, "weight": 45, "reps": 8, "rest": 120},
      {"setNumber": 4, "weight": 45, "reps": 7, "rest": 120}
    ]
  },
  {
    "name": "Push-ups",
    "type": "weight_training",
    "isBodyweight": true,
    "sets": [
      {"setNumber": 1, "reps": 15, "rest": 60},
      {"setNumber": 2, "reps": 15, "rest": 60},
      {"setNumber": 3, "reps": 14, "rest": 60}
    ]
  },
  {
    "name": "Bent-Over Row",
    "type": "weight_training",
    "isBodyweight": false,
    "sets": [
      {"setNumber": 1, "weight": 35, "reps": 10, "rest": 90},
      {"setNumber": 2, "weight": 35, "reps": 10, "rest": 90},
      {"setNumber": 3, "weight": 35, "reps": 9, "rest": 90}
    ]
  }
]'::jsonb,
'{
  "totalSets": 10,
  "totalReps": 106,
  "totalWeight": 4195,
  "totalDistance": 0,
  "totalDuration": 0,
  "totalCalories": 0,
  "exerciseCount": 3,
  "typeBreakdown": {
    "weight_training": 3,
    "cardio": 0,
    "flexibility": 0
  }
}'::jsonb,
'Excellent session! Increased weight on bench press.',
5,
'strong',
'2026-01-13 16:00:00'
);

-- Workout 3: Mixed (2026-01-17)
INSERT INTO workouts (trainee_id, trainer_id, date, duration, exercises, summary, notes, rating, mood, created_at) VALUES
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '2026-01-17', 75,
'[
  {
    "name": "Squat",
    "type": "weight_training",
    "isBodyweight": false,
    "sets": [
      {"setNumber": 1, "weight": 75, "reps": 8, "rest": 90},
      {"setNumber": 2, "weight": 75, "reps": 8, "rest": 90},
      {"setNumber": 3, "weight": 75, "reps": 8, "rest": 90}
    ]
  },
  {
    "name": "Running",
    "type": "cardio",
    "sets": [
      {"setNumber": 1, "distance": 3.5, "duration": 20.0, "pace": 5.71, "calories": 280}
    ]
  },
  {
    "name": "Static Stretching",
    "type": "flexibility",
    "sets": [
      {"setNumber": 1, "duration": 15, "holdTime": 45}
    ]
  }
]'::jsonb,
'{
  "totalSets": 5,
  "totalReps": 24,
  "totalWeight": 1800,
  "totalDistance": 3.5,
  "totalDuration": 35,
  "totalCalories": 280,
  "exerciseCount": 3,
  "typeBreakdown": {
    "weight_training": 1,
    "cardio": 1,
    "flexibility": 1
  }
}'::jsonb,
'Good variety today. Cardio pace is improving!',
4,
'tired',
'2026-01-17 15:30:00'
);

-- =====================================================
-- SESSION CARDS
-- =====================================================

INSERT INTO session_cards (trainee_id, trainer_id, date, summary, achievements, areas_for_improvement, next_session_goals, trainer_notes, rating, tags, created_at) VALUES
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '2026-01-10',
'Excellent lower body session. Jane showed great form on squats and is progressing well.',
ARRAY['Completed all sets with good form', 'Increased squat weight from last session', 'Demonstrated strong core stability'],
ARRAY['Work on ankle mobility', 'Increase depth on squats gradually'],
ARRAY['Add 2.5kg to squat next session', 'Include more mobility work in warm-up'],
'Jane is responding well to progressive overload. Keep monitoring form as weight increases.',
5,
ARRAY['strength', 'lower-body', 'progress'],
'2026-01-10 15:30:00'
),
('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '2026-01-13',
'Great upper body workout. Jane is building good pressing strength.',
ARRAY['Hit new PR on bench press (45kg)', 'Maintained good form on push-ups', 'Strong mind-muscle connection'],
ARRAY['Work on lat activation in rowing', 'Increase time under tension'],
ARRAY['Continue progressive overload on bench', 'Focus on pulling movements next session'],
'Upper body strength is developing nicely. Consider adding more volume to back work.',
5,
ARRAY['strength', 'upper-body', 'personal-record'],
'2026-01-13 16:15:00'
);

-- =====================================================
-- BODY WEIGHT ENTRIES
-- =====================================================

INSERT INTO body_weight_entries (trainee_id, weight, date, body_fat_percentage, notes, created_at) VALUES
('00000000-0000-0000-0000-000000000011', 60.0, '2025-11-01', 24.5, 'Starting weight', '2025-11-01 09:00:00'),
('00000000-0000-0000-0000-000000000011', 59.5, '2025-11-15', 23.8, 'Making progress', '2025-11-15 09:00:00'),
('00000000-0000-0000-0000-000000000011', 59.0, '2025-12-01', 23.2, 'Consistent progress', '2025-12-01 09:00:00'),
('00000000-0000-0000-0000-000000000011', 58.5, '2025-12-15', 22.5, 'Feeling good', '2025-12-15 09:00:00'),
('00000000-0000-0000-0000-000000000011', 58.5, '2026-01-01', 22.0, 'Maintaining weight', '2026-01-01 09:00:00'),
('00000000-0000-0000-0000-000000000011', 58.5, '2026-01-15', 21.8, 'Stable and strong', '2026-01-15 09:00:00');

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

INSERT INTO notifications (user_id, type, title, message, resource_type, resource_id, is_read, created_at) VALUES
('00000000-0000-0000-0000-000000000011', 'schedule_created', 'นัดหมายใหม่', 'คุณมีนัดฝึกใหม่: Strength Training วันที่ ' || TO_CHAR(CURRENT_DATE, 'DD/MM/YYYY') || ' เวลา 14:00', 'schedules', NULL, false, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000011', 'session_card_created', 'การ์ดสรุปผลใหม่', 'โค้ชได้สรุปผลการฝึกของคุณแล้ว - คะแนน: 5/5', 'session_cards', NULL, false, CURRENT_TIMESTAMP - INTERVAL '5 hours'),
('00000000-0000-0000-0000-000000000011', 'workout_logged', 'บันทึกการฝึกใหม่', 'โค้ชได้บันทึกผลการฝึกของคุณวันที่ 17/01/2026', 'workouts', NULL, true, '2026-01-17 15:30:00');

-- =====================================================
-- Refresh materialized views
-- =====================================================

SELECT refresh_all_materialized_views();

-- =====================================================
-- Verify seed data
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Demo data seeded successfully!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Users: % (% trainers, % trainees)', 
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM users WHERE role = 'trainer'),
        (SELECT COUNT(*) FROM users WHERE role = 'trainee');
    RAISE NOTICE 'Exercises: %', (SELECT COUNT(*) FROM exercises);
    RAISE NOTICE 'Schedules: %', (SELECT COUNT(*) FROM schedules);
    RAISE NOTICE 'Workouts: %', (SELECT COUNT(*) FROM workouts);
    RAISE NOTICE 'Session Cards: %', (SELECT COUNT(*) FROM session_cards);
    RAISE NOTICE 'Body Weight Entries: %', (SELECT COUNT(*) FROM body_weight_entries);
    RAISE NOTICE 'Notifications: %', (SELECT COUNT(*) FROM notifications);
    RAISE NOTICE '==============================================';
END $$;
