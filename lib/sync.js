import { supabase } from './supabase';
import db from '../db/schema';

// Push local data to Supabase
export const syncToCloud = async (userId) => {
  try {
    // Sync routines
    const routines = db.getAllSync(
      'SELECT * FROM routines WHERE user_id = ? OR user_id IS NULL',
      [userId]
    );
    for (const r of routines) {
      await supabase.from('routines').upsert({
        id: r.id, user_id: userId,
        name: r.name, description: r.description,
        is_active: r.is_active === 1,
      });
    }

    // Sync sessions
    const sessions = db.getAllSync(
      'SELECT * FROM sessions WHERE user_id = ? OR user_id IS NULL',
      [userId]
    );
    for (const s of sessions) {
      await supabase.from('sessions').upsert({
        id: s.id, user_id: userId,
        routine_id: s.routine_id,
        date: s.date, notes: s.notes,
        duration_secs: s.duration_secs,
      });
    }

    // Sync session sets
    const sets = db.getAllSync(
      `SELECT ss.* FROM session_sets ss
       JOIN sessions s ON ss.session_id = s.id
       WHERE s.user_id = ? OR s.user_id IS NULL`,
      [userId]
    );
    for (const set of sets) {
      await supabase.from('session_sets').upsert({
        id: set.id, user_id: userId,
        session_id: set.session_id,
        exercise_id: set.exercise_id,
        set_number: set.set_number,
        weight_kg: set.weight_kg, reps: set.reps,
        set_type: set.set_type || 'normal',
        rpe: set.rpe,
        is_personal_best: set.is_personal_best === 1,
      });
    }

    console.log('[Sync] Push to cloud complete ✓');
  } catch (e) {
    console.error('[Sync] Push failed', e);
  }
};

// Pull cloud data to local SQLite
export const syncFromCloud = async (userId) => {
  try {
    // Pull routines
    const { data: routines } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId);

    routines?.forEach((r) => {
      db.runSync(
        `INSERT OR REPLACE INTO routines
         (id, name, description, is_active, user_id)
         VALUES (?, ?, ?, ?, ?)`,
        [r.id, r.name, r.description,
         r.is_active ? 1 : 0, userId]
      );
    });

    // Pull sessions
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId);

    sessions?.forEach((s) => {
      db.runSync(
        `INSERT OR REPLACE INTO sessions
         (id, routine_id, date, notes, duration_secs, user_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [s.id, s.routine_id, s.date,
         s.notes, s.duration_secs, userId]
      );
    });

    // Pull session sets
    const { data: sets } = await supabase
      .from('session_sets')
      .select('*')
      .eq('user_id', userId);

    sets?.forEach((set) => {
      db.runSync(
        `INSERT OR REPLACE INTO session_sets
         (id, session_id, exercise_id, set_number,
          weight_kg, reps, set_type, rpe,
          is_personal_best, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [set.id, set.session_id, set.exercise_id,
         set.set_number, set.weight_kg, set.reps,
         set.set_type, set.rpe,
         set.is_personal_best ? 1 : 0, userId]
      );
    });

    console.log('[Sync] Pull from cloud complete ✓');
  } catch (e) {
    console.error('[Sync] Pull failed', e);
  }
};
