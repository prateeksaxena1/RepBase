const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const WebSocket = require('ws');

const SUPABASE_URL = 'https://mmgiwxwbjapqlhnslhxk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZ2l3eHdiamFwcWxobnNsaHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTYzNDMsImV4cCI6MjA5MzYzMjM0M30.YtmILdHy9Vniv8ejaJk_io4KbTBJBcGKUac2eQL-6ns';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { transport: WebSocket },
});
const USER_ID = '23a6f032-ae93-4bae-8417-178f35ee5389';
const uuid = () => crypto.randomUUID();

// The user already has routine "Push" with id 0da5257e-c20b-4b55-af06-99cd4e17ee5b
const EXISTING_PUSH_ROUTINE_ID = '0da5257e-c20b-4b55-af06-99cd4e17ee5b';

async function seed() {
  console.log('🌱 Seeding sample data for user:', USER_ID);

  // ── 1. Create additional routines (Pull, Legs) ──
  const pullRoutineId = uuid();
  const legsRoutineId = uuid();

  const { error: routineErr } = await supabase.from('routines').upsert([
    { id: pullRoutineId, user_id: USER_ID, name: 'Pull', description: 'Back & Biceps day', is_active: false },
    { id: legsRoutineId, user_id: USER_ID, name: 'Legs', description: 'Quads, Hamstrings & Glutes', is_active: false },
  ]);
  if (routineErr) console.error('Routines error:', routineErr);
  else console.log('✅ Routines created (Pull, Legs)');

  // ── 2. Create routine days ──
  const pushDay1 = uuid(), pullDay1 = uuid(), legsDay1 = uuid();

  const { error: dayErr } = await supabase.from('routine_days').upsert([
    { id: pushDay1, routine_id: EXISTING_PUSH_ROUTINE_ID, user_id: USER_ID, label: 'Push Day', day_order: 0 },
    { id: pullDay1, routine_id: pullRoutineId, user_id: USER_ID, label: 'Pull Day', day_order: 0 },
    { id: legsDay1, routine_id: legsRoutineId, user_id: USER_ID, label: 'Leg Day', day_order: 0 },
  ]);
  if (dayErr) console.error('Days error:', dayErr);
  else console.log('✅ Routine days created');

  // ── 3. Create routine exercises ──
  const routineExercises = [
    // Push day
    { id: uuid(), day_id: pushDay1, user_id: USER_ID, exercise_id: 'barbell-bench-press', target_sets: 4, target_reps: '6-8', exercise_order: 0 },
    { id: uuid(), day_id: pushDay1, user_id: USER_ID, exercise_id: 'incline-db-press', target_sets: 3, target_reps: '8-10', exercise_order: 1 },
    { id: uuid(), day_id: pushDay1, user_id: USER_ID, exercise_id: 'overhead-press', target_sets: 3, target_reps: '8-10', exercise_order: 2 },
    { id: uuid(), day_id: pushDay1, user_id: USER_ID, exercise_id: 'lateral-raise', target_sets: 3, target_reps: '12-15', exercise_order: 3 },
    { id: uuid(), day_id: pushDay1, user_id: USER_ID, exercise_id: 'tricep-pushdown', target_sets: 3, target_reps: '10-12', exercise_order: 4 },
    // Pull day
    { id: uuid(), day_id: pullDay1, user_id: USER_ID, exercise_id: 'barbell-row', target_sets: 4, target_reps: '6-8', exercise_order: 0 },
    { id: uuid(), day_id: pullDay1, user_id: USER_ID, exercise_id: 'lat-pulldown', target_sets: 3, target_reps: '8-10', exercise_order: 1 },
    { id: uuid(), day_id: pullDay1, user_id: USER_ID, exercise_id: 'cable-row', target_sets: 3, target_reps: '10-12', exercise_order: 2 },
    { id: uuid(), day_id: pullDay1, user_id: USER_ID, exercise_id: 'face-pull', target_sets: 3, target_reps: '15-20', exercise_order: 3 },
    { id: uuid(), day_id: pullDay1, user_id: USER_ID, exercise_id: 'barbell-curl', target_sets: 3, target_reps: '10-12', exercise_order: 4 },
    // Leg day
    { id: uuid(), day_id: legsDay1, user_id: USER_ID, exercise_id: 'squat', target_sets: 4, target_reps: '5-6', exercise_order: 0 },
    { id: uuid(), day_id: legsDay1, user_id: USER_ID, exercise_id: 'romanian-dl', target_sets: 3, target_reps: '8-10', exercise_order: 1 },
    { id: uuid(), day_id: legsDay1, user_id: USER_ID, exercise_id: 'leg-press', target_sets: 3, target_reps: '10-12', exercise_order: 2 },
    { id: uuid(), day_id: legsDay1, user_id: USER_ID, exercise_id: 'leg-curl', target_sets: 3, target_reps: '10-12', exercise_order: 3 },
    { id: uuid(), day_id: legsDay1, user_id: USER_ID, exercise_id: 'standing-calf-raise', target_sets: 4, target_reps: '12-15', exercise_order: 4 },
  ];

  const { error: exErr } = await supabase.from('routine_exercises').upsert(routineExercises);
  if (exErr) console.error('Routine exercises error:', exErr);
  else console.log('✅ Routine exercises created (15 exercises across 3 days)');

  // ── 4. Create sessions (past 2 weeks of workouts) ──
  const sessions = [];
  const sessionSets = [];

  const workoutData = [
    // Week 1
    { date: '2026-05-01', routineId: EXISTING_PUSH_ROUTINE_ID, duration: 3600, notes: 'Felt strong today', exercises: [
      { id: 'barbell-bench-press', sets: [[80, 8], [85, 6], [85, 6], [80, 8]] },
      { id: 'incline-db-press', sets: [[30, 10], [32.5, 8], [30, 9]] },
      { id: 'overhead-press', sets: [[50, 8], [52.5, 7], [50, 8]] },
      { id: 'lateral-raise', sets: [[10, 15], [10, 14], [10, 12]] },
      { id: 'tricep-pushdown', sets: [[25, 12], [27.5, 10], [25, 11]] },
    ]},
    { date: '2026-05-02', routineId: pullRoutineId, duration: 3300, notes: 'Good pump on rows', exercises: [
      { id: 'barbell-row', sets: [[70, 8], [75, 6], [75, 6], [70, 8]] },
      { id: 'lat-pulldown', sets: [[55, 10], [60, 8], [55, 9]] },
      { id: 'cable-row', sets: [[50, 12], [55, 10], [50, 11]] },
      { id: 'face-pull', sets: [[15, 20], [17.5, 15], [15, 18]] },
      { id: 'barbell-curl', sets: [[30, 12], [32.5, 10], [30, 11]] },
    ]},
    { date: '2026-05-03', routineId: legsRoutineId, duration: 4200, notes: 'PR on squats!', exercises: [
      { id: 'squat', sets: [[100, 6], [105, 5], [110, 4], [100, 6]] },
      { id: 'romanian-dl', sets: [[80, 10], [85, 8], [80, 9]] },
      { id: 'leg-press', sets: [[180, 12], [200, 10], [180, 11]] },
      { id: 'leg-curl', sets: [[40, 12], [45, 10], [40, 11]] },
      { id: 'standing-calf-raise', sets: [[60, 15], [65, 12], [60, 14], [60, 13]] },
    ]},
    // Week 1 - second round
    { date: '2026-05-05', routineId: EXISTING_PUSH_ROUTINE_ID, duration: 3480, notes: 'Bench going up', exercises: [
      { id: 'barbell-bench-press', sets: [[82.5, 8], [87.5, 6], [87.5, 5], [82.5, 7]] },
      { id: 'incline-db-press', sets: [[32.5, 10], [35, 8], [32.5, 8]] },
      { id: 'overhead-press', sets: [[52.5, 8], [55, 6], [52.5, 7]] },
      { id: 'lateral-raise', sets: [[12, 12], [12, 11], [10, 14]] },
      { id: 'tricep-pushdown', sets: [[27.5, 12], [30, 10], [27.5, 11]] },
    ]},
    { date: '2026-05-06', routineId: pullRoutineId, duration: 3150, exercises: [
      { id: 'barbell-row', sets: [[72.5, 8], [77.5, 6], [77.5, 6], [72.5, 7]] },
      { id: 'lat-pulldown', sets: [[57.5, 10], [62.5, 8], [57.5, 9]] },
      { id: 'cable-row', sets: [[52.5, 12], [57.5, 10], [52.5, 10]] },
      { id: 'face-pull', sets: [[17.5, 18], [20, 15], [17.5, 16]] },
      { id: 'barbell-curl', sets: [[32.5, 10], [35, 8], [32.5, 10]] },
    ]},
    { date: '2026-05-07', routineId: legsRoutineId, duration: 4050, notes: 'Legs were toast', exercises: [
      { id: 'squat', sets: [[102.5, 6], [107.5, 5], [107.5, 5], [102.5, 6]] },
      { id: 'romanian-dl', sets: [[82.5, 10], [87.5, 8], [82.5, 8]] },
      { id: 'leg-press', sets: [[190, 12], [210, 10], [190, 10]] },
      { id: 'leg-curl', sets: [[42.5, 12], [47.5, 10], [42.5, 10]] },
      { id: 'standing-calf-raise', sets: [[62.5, 15], [67.5, 12], [62.5, 13], [62.5, 12]] },
    ]},
    // Week 2
    { date: '2026-05-08', routineId: EXISTING_PUSH_ROUTINE_ID, duration: 3720, notes: 'New bench PR 90kg!', exercises: [
      { id: 'barbell-bench-press', sets: [[85, 8], [90, 5], [87.5, 6], [85, 7]] },
      { id: 'incline-db-press', sets: [[35, 9], [35, 8], [32.5, 9]] },
      { id: 'overhead-press', sets: [[55, 7], [55, 6], [52.5, 8]] },
      { id: 'lateral-raise', sets: [[12, 14], [12, 12], [12, 11]] },
      { id: 'tricep-pushdown', sets: [[30, 12], [32.5, 10], [30, 10]] },
    ]},
    { date: '2026-05-09', routineId: pullRoutineId, duration: 3400, notes: 'Back day pump', exercises: [
      { id: 'barbell-row', sets: [[75, 8], [80, 6], [80, 5], [75, 7]] },
      { id: 'lat-pulldown', sets: [[60, 10], [65, 8], [60, 8]] },
      { id: 'cable-row', sets: [[55, 12], [60, 10], [55, 10]] },
      { id: 'face-pull', sets: [[20, 18], [22.5, 14], [20, 16]] },
      { id: 'barbell-curl', sets: [[35, 10], [35, 8], [32.5, 10]] },
    ]},
  ];

  for (const workout of workoutData) {
    const sessionId = uuid();
    sessions.push({
      id: sessionId,
      user_id: USER_ID,
      routine_id: workout.routineId,
      date: workout.date,
      notes: workout.notes || null,
      duration_secs: workout.duration,
    });

    let setNum = 1;
    for (const exercise of workout.exercises) {
      for (const [weight, reps] of exercise.sets) {
        sessionSets.push({
          id: uuid(),
          user_id: USER_ID,
          session_id: sessionId,
          exercise_id: exercise.id,
          set_number: setNum++,
          weight_kg: weight,
          reps: reps,
          set_type: 'normal',
          rpe: null,
          is_personal_best: false,
        });
      }
    }
  }

  const { error: sessErr } = await supabase.from('sessions').upsert(sessions);
  if (sessErr) console.error('Sessions error:', sessErr);
  else console.log(`✅ ${sessions.length} sessions created`);

  const { error: setErr } = await supabase.from('session_sets').upsert(sessionSets);
  if (setErr) console.error('Session sets error:', setErr);
  else console.log(`✅ ${sessionSets.length} session sets created`);

  // ── 5. Update profile ──
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: USER_ID,
    username: 'prateek',
    full_name: 'Prateek Saxena',
    bio: 'Chasing PRs 🏋️ | PPL Split | Consistency > Motivation',
  });
  if (profileErr) console.error('Profile error:', profileErr);
  else console.log('✅ Profile updated');

  console.log('\n🎉 Seed complete!');
  console.log(`   • 3 routines (Push exists + Pull, Legs)`);
  console.log(`   • 3 routine days with 15 exercises`);
  console.log(`   • ${sessions.length} workout sessions`);
  console.log(`   • ${sessionSets.length} logged sets`);
}

seed().catch(console.error);
