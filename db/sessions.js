import db from './schema';

export const getAllSessions = () => {
  try {
    return db.getAllSync(`
      SELECT s.*,
       r.name as routine_name,
       COUNT(DISTINCT ss.id) as total_sets,
       SUM(ss.weight_kg * ss.reps) as total_volume,
       SUM(ss.is_personal_best) as pr_count
      FROM sessions s
      LEFT JOIN routines r ON s.routine_id = r.id
      LEFT JOIN session_sets ss ON ss.session_id = s.id
      GROUP BY s.id
      ORDER BY s.date DESC
    `);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const createSession = ({ id, routineId, date }) => {
  try {
    return db.runSync(
      'INSERT INTO sessions (id, routine_id, date) VALUES (?, ?, ?)',
      [id, routineId, date]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const updateSessionDuration = (id, durationSecs) => {
  try {
    return db.runSync('UPDATE sessions SET duration_secs = ? WHERE id = ?', [durationSecs, id]);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const updateSessionNotes = (id, notes) => {
  try {
    return db.runSync('UPDATE sessions SET notes = ? WHERE id = ?', [notes, id]);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getSetsForSession = (sessionId) => {
  try {
    return db.getAllSync(
      `SELECT ss.*, e.name FROM session_sets ss
       JOIN exercises e ON ss.exercise_id = e.id
       WHERE ss.session_id = ? ORDER BY ss.set_number`,
      [sessionId]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const logSet = ({ id, sessionId, exerciseId, setNumber, weightKg, reps, setType = 'normal', rpe = null }) => {
  try {
    return db.runSync(
      `INSERT INTO session_sets
       (id, session_id, exercise_id, set_number, weight_kg, reps, is_personal_best, set_type, rpe)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [id, sessionId, exerciseId, setNumber, weightKg, reps, setType, rpe]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getProgressForExercise = (exerciseId) => {
  try {
    return db.getAllSync(
      `SELECT s.date, MAX(ss.weight_kg) as max_weight, COUNT(*) as total_sets
       FROM session_sets ss
       JOIN sessions s ON ss.session_id = s.id
       WHERE ss.exercise_id = ?
       GROUP BY s.date
       ORDER BY s.date ASC`,
      [exerciseId]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getPersonalBest = (exerciseId) => {
  try {
    return db.getFirstSync(
      'SELECT MAX(weight_kg) as pb FROM session_sets WHERE exercise_id = ?',
      [exerciseId]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getLastSetsForExercise = (exerciseId) => {
  try {
    return db.getAllSync(
      `SELECT ss.weight_kg, ss.reps, ss.set_number
       FROM session_sets ss
       JOIN sessions s ON ss.session_id = s.id
       WHERE ss.exercise_id = ?
       ORDER BY s.date DESC, ss.set_number ASC
       LIMIT 5`,
      [exerciseId]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return [];
  }
};

export const checkPersonalBest = (exerciseId, weightKg) => {
  try {
    const pb = db.getFirstSync(
      `SELECT MAX(weight_kg) as best FROM session_sets
       WHERE exercise_id = ? AND is_personal_best = 0`,
      [exerciseId]
    );
    return !pb?.best || weightKg > pb.best;
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return false;
  }
};

export const markPersonalBest = (setId) => {
  try {
    return db.runSync(
      'UPDATE session_sets SET is_personal_best = 1 WHERE id = ?',
      [setId]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getVolumeOverTime = () => {
  try {
    return db.getAllSync(
      `SELECT s.date,
       SUM(ss.weight_kg * ss.reps) as total_volume,
       COUNT(DISTINCT ss.exercise_id) as exercise_count
       FROM sessions s
       JOIN session_sets ss ON ss.session_id = s.id
       GROUP BY s.date
       ORDER BY s.date ASC`
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return [];
  }
};

export const getMuscleSplit = () => {
  try {
    return db.getAllSync(
      `SELECT e.muscle_group,
       COUNT(*) as total_sets,
       SUM(ss.weight_kg * ss.reps) as total_volume
       FROM session_sets ss
       JOIN exercises e ON ss.exercise_id = e.id
       GROUP BY e.muscle_group
       ORDER BY total_sets DESC`
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return [];
  }
};

export const getWorkoutFrequency = () => {
  try {
    return db.getAllSync(
      `SELECT date, COUNT(*) as workout_count
       FROM sessions
       GROUP BY date
       ORDER BY date ASC`
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return [];
  }
};

export const getWorkoutStreak = () => {
  try {
    const sessions = db.getAllSync(
      'SELECT DISTINCT date FROM sessions ORDER BY date DESC'
    );
    if (!sessions.length) return 0;
    let streak = 0;
    let current = new Date();
    current.setHours(0,0,0,0);
    for (const s of sessions) {
      const d = new Date(s.date);
      d.setHours(0,0,0,0);
      const diff = (current - d) / (1000 * 60 * 60 * 24);
      if (diff <= 1) { streak++; current = d; }
      else break;
    }
    return streak;
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return 0;
  }
};

export const getTotalStats = () => {
  try {
    const sessions = db.getFirstSync(
      'SELECT COUNT(*) as total FROM sessions'
    );
    const sets = db.getFirstSync(
      'SELECT COUNT(*) as total FROM session_sets'
    );
    const volume = db.getFirstSync(
      'SELECT ROUND(SUM(weight_kg * reps), 0) as total FROM session_sets'
    );
    const prs = db.getFirstSync(
      'SELECT COUNT(*) as total FROM session_sets WHERE is_personal_best = 1'
    );
    return {
      workouts: sessions?.total || 0,
      sets: sets?.total || 0,
      volume: volume?.total || 0,
      prs: prs?.total || 0,
    };
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return {
      workouts: 0,
      sets: 0,
      volume: 0,
      prs: 0,
    };
  }
};


