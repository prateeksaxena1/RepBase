import db from '../db/schema';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';

export const loadDemoData = async (userId) => {
  if (!userId) return false;

  try {
    console.log('[DemoData] Starting local hydration...');

    // 1. Create a Routine
    const routineId = Crypto.randomUUID();
    db.runSync(
      'INSERT INTO routines (id, user_id, name, description, is_active) VALUES (?, ?, ?, ?, 1)',
      [routineId, userId, 'Push/Pull/Legs (Demo)', 'A balanced 3-day split for maximum hypertrophy.']
    );

    // 2. Add Days
    const pushDayId = Crypto.randomUUID();
    const pullDayId = Crypto.randomUUID();
    const legsDayId = Crypto.randomUUID();
    
    db.runSync('INSERT INTO routine_days (id, user_id, routine_id, label, day_order) VALUES (?, ?, ?, ?, ?)', [pushDayId, userId, routineId, 'Push Day', 1]);
    db.runSync('INSERT INTO routine_days (id, user_id, routine_id, label, day_order) VALUES (?, ?, ?, ?, ?)', [pullDayId, userId, routineId, 'Pull Day', 2]);
    db.runSync('INSERT INTO routine_days (id, user_id, routine_id, label, day_order) VALUES (?, ?, ?, ?, ?)', [legsDayId, userId, routineId, 'Legs Day', 3]);

    // 3. Add Exercises
    const addEx = (dayId, exerciseId, sets, reps, order) => {
      db.runSync(
        'INSERT INTO routine_exercises (id, user_id, day_id, exercise_id, target_sets, target_reps, exercise_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [Crypto.randomUUID(), userId, dayId, exerciseId, sets, reps, order]
      );
    };

    // Push Exercises
    addEx(pushDayId, 'barbell-bench-press', 4, '8-10', 1);
    addEx(pushDayId, 'overhead-press', 3, '8-12', 2);
    addEx(pushDayId, 'incline-db-press', 3, '10-12', 3);
    addEx(pushDayId, 'tricep-pushdown', 3, '12-15', 4);

    // Pull Exercises
    addEx(pullDayId, 'deadlift', 3, '5-8', 1);
    addEx(pullDayId, 'lat-pulldown', 3, '10-12', 2);
    addEx(pullDayId, 'barbell-row', 3, '8-10', 3);
    addEx(pullDayId, 'db-curl', 3, '12-15', 4);

    // Legs Exercises
    addEx(legsDayId, 'squat', 4, '6-8', 1);
    addEx(legsDayId, 'leg-press', 3, '10-12', 2);
    addEx(legsDayId, 'romanian-dl', 3, '8-10', 3);
    addEx(legsDayId, 'leg-extension', 3, '12-15', 4);

    // 4. Create Fake Historical Sessions
    const today = new Date();
    for (let i = 1; i <= 5; i++) {
      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() - i * 2); // Every 2 days
      const dateStr = sessionDate.toISOString().split('T')[0];
      const sessionId = Crypto.randomUUID();

      db.runSync(
        'INSERT INTO sessions (id, user_id, routine_id, date, duration_secs) VALUES (?, ?, ?, ?, ?)',
        [sessionId, userId, routineId, dateStr, 3600 + Math.floor(Math.random() * 1800)]
      );

      // Add sets for barbell bench press (so there's progress data)
      for (let s = 1; s <= 4; s++) {
        db.runSync(
          'INSERT INTO session_sets (id, user_id, session_id, exercise_id, set_number, weight_kg, reps) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [Crypto.randomUUID(), userId, sessionId, 'barbell-bench-press', s, 60 + (i * 2.5), 8]
        );
      }
    }

    // 5. Add Nutrition Goals
    db.runSync(`DELETE FROM nutrition_goals`);
    db.runSync(
      `INSERT INTO nutrition_goals (id, calories, protein, carbs, fat, fiber, sugar, sodium, water_ml)
       VALUES (?, 2500, 180, 250, 75, 30, 45, 2000, 3000)`,
      [Crypto.randomUUID()]
    );

    // 6. Add Food Logs (Today)
    const todayStr = today.toISOString().split('T')[0];
    
    const demoFoodId = Crypto.randomUUID();
    db.runSync(
      `INSERT INTO foods (id, name, brand, serving_size, serving_unit, calories, protein, carbs, fat, is_custom)
       VALUES (?, 'Chicken Breast & Rice (Demo)', 'Home', 1, 'serving', 550, 45, 60, 12, 1)`,
      [demoFoodId]
    );

    db.runSync(
      `INSERT INTO food_logs (id, user_id, food_id, date, meal_type, servings, calories, protein, carbs, fat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Crypto.randomUUID(), userId, demoFoodId, todayStr, 'Lunch', 1, 550, 45, 60, 12]
    );
    db.runSync(
      `INSERT INTO food_logs (id, user_id, food_id, date, meal_type, servings, calories, protein, carbs, fat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Crypto.randomUUID(), userId, demoFoodId, todayStr, 'Dinner', 1.5, 825, 67.5, 90, 18]
    );

    // 7. Sync to Cloud
    console.log('[DemoData] Local hydration done. Syncing to Supabase...');
    const { syncToCloud } = require('./sync');
    await syncToCloud(userId);

    // 8. Add a Social Post
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', userId).single();
    if (profile) {
       await supabase.from('workout_posts').insert({
         user_id: userId,
         caption: `Just loaded my demo data and started the Push/Pull/Legs routine! Let's go! 💪🔥`,
         is_public: true
       });
    }

    console.log('[DemoData] Demo hydration complete!');
    return true;

  } catch (e) {
    console.error('[DemoData Error]', e);
    return false;
  }
};
