import db from './schema';

export const getAllSessions = () => {
  try {
    return db.getAllSync(`
      SELECT s.*, r.name as routine_name
      FROM sessions s
      LEFT JOIN routines r ON s.routine_id = r.id
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

export const logSet = ({ id, sessionId, exerciseId, setNumber, weightKg, reps }) => {
  try {
    return db.runSync(
      `INSERT INTO session_sets
       (id, session_id, exercise_id, set_number, weight_kg, reps, is_personal_best)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [id, sessionId, exerciseId, setNumber, weightKg, reps]
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
