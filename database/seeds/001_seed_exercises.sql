-- =====================================================
-- Seed: 001 - Seed exercise library
-- Description: Pre-populate common exercises
-- Created: 2026-01-24
-- =====================================================

-- =====================================================
-- WEIGHT TRAINING EXERCISES
-- =====================================================

INSERT INTO exercises (name, type, category, description, muscle_groups, equipment, difficulty, instructions, tips, warnings, metadata) VALUES

-- Legs
('Squat', 'weight_training', 'Legs', 'Compound lower body exercise targeting quads, glutes, and hamstrings', 
 ARRAY['quadriceps', 'glutes', 'hamstrings', 'core'],
 ARRAY['barbell', 'squat rack'],
 'intermediate',
 ARRAY[
   'Set up barbell at shoulder height on squat rack',
   'Position bar on upper back (not neck)',
   'Stand with feet shoulder-width apart',
   'Descend by bending knees and hips until thighs are parallel to ground',
   'Drive through heels to return to starting position'
 ],
 ARRAY['Keep chest up and core tight', 'Maintain neutral spine throughout movement', 'Knees should track over toes'],
 ARRAY['Do not round lower back', 'Avoid letting knees cave inward', 'Do not use excessive weight without proper form'],
 '{"defaultSets": 4, "defaultReps": 8, "restTime": 120}'::jsonb
),

('Deadlift', 'weight_training', 'Legs', 'Full-body compound lift focusing on posterior chain',
 ARRAY['hamstrings', 'glutes', 'lower back', 'traps', 'forearms'],
 ARRAY['barbell', 'plates'],
 'advanced',
 ARRAY[
   'Stand with feet hip-width apart, barbell over mid-foot',
   'Bend at hips and knees to grip bar just outside legs',
   'Keep back flat, chest up, and shoulders back',
   'Drive through heels, extending hips and knees simultaneously',
   'Stand fully upright, then reverse the movement to lower the bar'
 ],
 ARRAY['Keep bar close to body throughout lift', 'Engage lats by "pulling the bar into you"', 'Use mixed grip or straps for heavy weights'],
 ARRAY['Never round your lower back', 'Do not jerk the bar off the ground', 'Avoid hyperextending at top'],
 '{"defaultSets": 3, "defaultReps": 5, "restTime": 180}'::jsonb
),

('Leg Press', 'weight_training', 'Legs', 'Machine-based quad and glute exercise',
 ARRAY['quadriceps', 'glutes', 'hamstrings'],
 ARRAY['leg press machine'],
 'beginner',
 ARRAY[
   'Sit in leg press machine with back flat against pad',
   'Place feet shoulder-width apart on platform',
   'Release safety bars and lower platform by bending knees',
   'Push through heels to extend legs, stopping just before lockout'
 ],
 ARRAY['Keep lower back pressed against pad', 'Full range of motion for best results'],
 ARRAY['Do not lock out knees completely', 'Avoid letting knees cave inward'],
 '{"defaultSets": 4, "defaultReps": 10, "restTime": 90}'::jsonb
),

-- Chest
('Bench Press', 'weight_training', 'Chest', 'Primary chest compound movement',
 ARRAY['pectorals', 'triceps', 'anterior deltoids'],
 ARRAY['barbell', 'bench', 'rack'],
 'intermediate',
 ARRAY[
   'Lie on flat bench with feet flat on floor',
   'Grip bar slightly wider than shoulder width',
   'Unrack bar and lower to mid-chest with control',
   'Press bar back up to starting position'
 ],
 ARRAY['Keep shoulder blades retracted', 'Touch bar to chest, don\'t bounce', 'Drive through legs for stability'],
 ARRAY['Always use a spotter for heavy weights', 'Do not flare elbows excessively', 'Avoid bouncing bar off chest'],
 '{"defaultSets": 4, "defaultReps": 8, "restTime": 120}'::jsonb
),

('Push-ups', 'weight_training', 'Chest', 'Bodyweight chest and tricep exercise',
 ARRAY['pectorals', 'triceps', 'anterior deltoids', 'core'],
 ARRAY[],
 'beginner',
 ARRAY[
   'Start in plank position with hands slightly wider than shoulders',
   'Lower body by bending elbows until chest nearly touches ground',
   'Push through palms to return to starting position',
   'Keep body in straight line throughout'
 ],
 ARRAY['Engage core to prevent sagging hips', 'Full range of motion for maximum benefit', 'Exhale on push, inhale on descent'],
 ARRAY['Do not let hips sag', 'Avoid flaring elbows too wide', 'Keep neck neutral'],
 '{"defaultSets": 4, "defaultReps": 20, "restTime": 60, "isBodyweight": true}'::jsonb
),

-- Back
('Pull-ups', 'weight_training', 'Back', 'Bodyweight back and bicep exercise',
 ARRAY['latissimus dorsi', 'biceps', 'rhomboids', 'core'],
 ARRAY['pull-up bar'],
 'intermediate',
 ARRAY[
   'Hang from bar with overhand grip, hands shoulder-width apart',
   'Pull body up until chin clears bar',
   'Lower with control to full extension',
   'Repeat for desired reps'
 ],
 ARRAY['Engage lats by thinking "elbows to hips"', 'Avoid swinging or using momentum', 'Full extension at bottom'],
 ARRAY['Do not use excessive swinging', 'Avoid partial reps', 'Progress gradually'],
 '{"defaultSets": 3, "defaultReps": 8, "restTime": 120, "isBodyweight": true}'::jsonb
),

('Bent-Over Row', 'weight_training', 'Back', 'Compound back exercise',
 ARRAY['latissimus dorsi', 'rhomboids', 'traps', 'biceps'],
 ARRAY['barbell'],
 'intermediate',
 ARRAY[
   'Stand with feet shoulder-width apart, holding barbell',
   'Bend at hips to approximately 45-degree angle',
   'Pull barbell to lower chest/upper abdomen',
   'Lower with control and repeat'
 ],
 ARRAY['Keep back flat throughout', 'Pull elbows back and up', 'Squeeze shoulder blades together at top'],
 ARRAY['Do not round lower back', 'Avoid using momentum', 'Keep core engaged'],
 '{"defaultSets": 4, "defaultReps": 8, "restTime": 90}'::jsonb
),

-- Shoulders
('Overhead Press', 'weight_training', 'Shoulders', 'Primary shoulder pressing movement',
 ARRAY['deltoids', 'triceps', 'upper chest'],
 ARRAY['barbell', 'rack'],
 'intermediate',
 ARRAY[
   'Stand with feet shoulder-width apart, bar at shoulder height',
   'Grip bar just outside shoulders',
   'Press bar overhead until arms fully extended',
   'Lower with control to starting position'
 ],
 ARRAY['Keep core tight', 'Full lockout at top', 'Bar path should be straight up'],
 ARRAY['Do not arch back excessively', 'Avoid pressing behind neck', 'Use appropriate weight'],
 '{"defaultSets": 4, "defaultReps": 8, "restTime": 120}'::jsonb
),

-- Arms
('Bicep Curls', 'weight_training', 'Arms', 'Isolation exercise for biceps',
 ARRAY['biceps'],
 ARRAY['dumbbells'],
 'beginner',
 ARRAY[
   'Stand with dumbbells at sides, palms facing forward',
   'Curl weights up while keeping elbows stationary',
   'Squeeze biceps at top',
   'Lower with control to starting position'
 ],
 ARRAY['Keep elbows close to body', 'No swinging or momentum', 'Full range of motion'],
 ARRAY['Do not swing weights', 'Avoid using momentum', 'Control the descent'],
 '{"defaultSets": 3, "defaultReps": 12, "restTime": 60}'::jsonb
),

('Tricep Dips', 'weight_training', 'Arms', 'Bodyweight tricep exercise',
 ARRAY['triceps', 'chest', 'anterior deltoids'],
 ARRAY['dip bars'],
 'intermediate',
 ARRAY[
   'Support yourself on parallel bars with arms extended',
   'Lower body by bending elbows until upper arms are parallel to ground',
   'Push back up to starting position',
   'Keep body upright or lean forward slightly for more chest activation'
 ],
 ARRAY['Keep shoulders down and back', 'Control the descent', 'Full extension at top'],
 ARRAY['Do not shrug shoulders', 'Avoid going too deep if you have shoulder issues', 'Progress gradually'],
 '{"defaultSets": 3, "defaultReps": 10, "restTime": 90, "isBodyweight": true}'::jsonb
);

-- =====================================================
-- CARDIO EXERCISES
-- =====================================================

INSERT INTO exercises (name, type, category, description, muscle_groups, equipment, difficulty, instructions, tips, warnings, metadata) VALUES

('Running', 'cardio', 'Cardio', 'Outdoor or treadmill running',
 ARRAY['legs', 'cardiovascular system'],
 ARRAY['running shoes', 'treadmill (optional)'],
 'beginner',
 ARRAY[
   'Warm up with 5-10 minutes of walking or light jogging',
   'Maintain steady pace appropriate for your fitness level',
   'Land on mid-foot, not heel or toes',
   'Keep upper body relaxed, arms swinging naturally',
   'Cool down with 5 minutes of walking'
 ],
 ARRAY['Start with shorter distances and build up gradually', 'Proper running shoes are essential', 'Breathe rhythmically'],
 ARRAY['Do not increase distance by more than 10% per week', 'Stop if you feel sharp pain', 'Stay hydrated'],
 '{"targetHeartRate": 140, "caloriesPerMinute": 10, "recommendedDuration": "20-60 minutes"}'::jsonb
),

('Cycling', 'cardio', 'Cardio', 'Stationary or outdoor cycling',
 ARRAY['legs', 'cardiovascular system'],
 ARRAY['bicycle', 'stationary bike'],
 'beginner',
 ARRAY[
   'Adjust seat height so leg is almost fully extended at bottom of pedal stroke',
   'Warm up with easy pace for 5-10 minutes',
   'Maintain steady cadence (60-90 RPM for beginners)',
   'Keep upper body relaxed',
   'Cool down with 5 minutes of easy cycling'
 ],
 ARRAY['Proper bike fit prevents injury', 'Vary resistance for interval training', 'Stay hydrated'],
 ARRAY['Do not ride with improper seat height', 'Build up duration gradually', 'Use appropriate gears'],
 '{"targetHeartRate": 130, "caloriesPerMinute": 8, "recommendedDuration": "30-90 minutes"}'::jsonb
),

('Jump Rope', 'cardio', 'Cardio', 'High-intensity cardio exercise',
 ARRAY['calves', 'shoulders', 'cardiovascular system'],
 ARRAY['jump rope'],
 'intermediate',
 ARRAY[
   'Start with rope behind feet',
   'Swing rope overhead and jump as it approaches feet',
   'Land softly on balls of feet',
   'Keep jumps low (just high enough to clear rope)',
   'Maintain upright posture'
 ],
 ARRAY['Start with short intervals', 'Use proper length rope', 'Jump on forgiving surface'],
 ARRAY['High impact - not suitable for everyone', 'Build up duration slowly', 'Stop if you feel joint pain'],
 '{"targetHeartRate": 150, "caloriesPerMinute": 12, "recommendedDuration": "10-30 minutes"}'::jsonb
),

('Rowing', 'cardio', 'Cardio', 'Full-body cardio on rowing machine',
 ARRAY['legs', 'back', 'arms', 'core', 'cardiovascular system'],
 ARRAY['rowing machine'],
 'intermediate',
 ARRAY[
   'Sit on rower with feet strapped in',
   'Start with arms extended, legs bent',
   'Push with legs first, then lean back slightly',
   'Pull handle to lower chest',
   'Reverse the movement: arms, torso, then legs'
 ],
 ARRAY['Proper form prevents injury', 'Legs do 60% of work', 'Smooth, controlled movements'],
 ARRAY['Do not round your back', 'Avoid pulling with arms first', 'Start with lower intensity'],
 '{"targetHeartRate": 140, "caloriesPerMinute": 11, "recommendedDuration": "20-60 minutes"}'::jsonb
);

-- =====================================================
-- FLEXIBILITY EXERCISES
-- =====================================================

INSERT INTO exercises (name, type, category, description, muscle_groups, equipment, difficulty, instructions, tips, warnings, metadata) VALUES

('Yoga Flow', 'flexibility', 'Flexibility', 'Dynamic yoga sequence for flexibility and mindfulness',
 ARRAY['full body'],
 ARRAY['yoga mat'],
 'beginner',
 ARRAY[
   'Start in mountain pose (standing tall)',
   'Flow through sun salutations',
   'Hold each pose for 5 deep breaths',
   'Move mindfully between poses',
   'End with savasana (corpse pose) for 5 minutes'
 ],
 ARRAY['Focus on breath', 'Don\'t force stretches', 'Use props if needed', 'Practice regularly for best results'],
 ARRAY['Avoid bouncing in stretches', 'Don\'t push past comfortable stretch', 'Consult doctor if you have injuries'],
 '{"recommendedDuration": "30-60 minutes", "holdTime": 30, "breathingPattern": "deep"}'::jsonb
),

('Static Stretching', 'flexibility', 'Flexibility', 'Traditional static stretching routine',
 ARRAY['full body'],
 ARRAY['yoga mat'],
 'beginner',
 ARRAY[
   'Warm up with 5 minutes of light movement',
   'Stretch each major muscle group',
   'Hold each stretch for 30-60 seconds',
   'Breathe deeply and relax into stretch',
   'Never bounce or force a stretch'
 ],
 ARRAY['Stretch after workouts when muscles are warm', 'Focus on tight areas', 'Relax and breathe'],
 ARRAY['Never stretch cold muscles', 'Stop if you feel sharp pain', 'Don\'t hold your breath'],
 '{"recommendedDuration": "15-30 minutes", "holdTime": 45, "breathingPattern": "deep and slow"}'::jsonb
),

('Foam Rolling', 'flexibility', 'Recovery', 'Self-myofascial release technique',
 ARRAY['full body'],
 ARRAY['foam roller'],
 'beginner',
 ARRAY[
   'Position foam roller under target muscle',
   'Support body weight with arms and legs',
   'Roll slowly over muscle, pausing on tender spots',
   'Spend 30-90 seconds on each muscle group',
   'Breathe normally throughout'
 ],
 ARRAY['Roll slowly and deliberately', 'Spend extra time on tight spots', 'Use regularly for best results'],
 ARRAY['Do not roll over joints or bones', 'Avoid rolling injured areas', 'Start with softer roller if too painful'],
 '{"recommendedDuration": "10-20 minutes", "holdTime": 60, "pressure": "moderate"}'::jsonb
),

('Dynamic Stretching', 'flexibility', 'Warm-up', 'Active stretching for pre-workout',
 ARRAY['full body'],
 ARRAY[],
 'beginner',
 ARRAY[
   'Perform controlled movements through full range of motion',
   'Examples: leg swings, arm circles, walking lunges',
   'Gradually increase range of motion',
   'Perform 10-15 reps of each movement',
   'Total warm-up: 5-10 minutes'
 ],
 ARRAY['Perfect for pre-workout warm-up', 'Increases blood flow', 'Improves mobility'],
 ARRAY['Start slowly and build up', 'Control movements, don\'t force', 'Stop if you feel pain'],
 '{"recommendedDuration": "5-10 minutes", "repsPerMovement": 12, "breathingPattern": "natural"}'::jsonb
);

-- Update usage_count to 0 for all seeded exercises
UPDATE exercises SET usage_count = 0 WHERE created_by IS NULL;

-- Mark these as system exercises (no creator)
UPDATE exercises SET created_by = NULL WHERE created_by IS NULL;
