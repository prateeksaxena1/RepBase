import db from './schema';

export const getAllRoutines = () => {
  try {
    const routines = db.getAllSync('SELECT * FROM routines ORDER BY created_at DESC');
    return routines.map((r) => {
      const dayCount = db.getFirstSync(
        'SELECT COUNT(*) as c FROM routine_days WHERE routine_id = ?', [r.id]
      ).c;
      const exerciseCount = db.getFirstSync(
        `SELECT COUNT(*) as c FROM routine_exercises re
         JOIN routine_days rd ON re.day_id = rd.id
         WHERE rd.routine_id = ?`, [r.id]
      ).c;
      return { ...r, dayCount, exerciseCount };
    });
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getRoutineById = (id) => {
  try {
    return db.getFirstSync('SELECT * FROM routines WHERE id = ?', [id]);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const createRoutine = ({ id, name, description }) => {
  try {
    return db.runSync(
      'INSERT INTO routines (id, name, description, is_active) VALUES (?, ?, ?, 0)',
      [id, name, description || '']
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const updateRoutine = ({ id, name, description }) => {
  try {
    return db.runSync(
      'UPDATE routines SET name = ?, description = ? WHERE id = ?',
      [name, description || '', id]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const deleteRoutine = (id) => {
  try {
    return db.runSync('DELETE FROM routines WHERE id = ?', [id]);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const setActiveRoutine = (id) => {
  try {
    db.runSync('UPDATE routines SET is_active = 0');
    db.runSync('UPDATE routines SET is_active = 1 WHERE id = ?', [id]);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getDaysForRoutine = (routineId) => {
  try {
    return db.getAllSync(
      'SELECT * FROM routine_days WHERE routine_id = ? ORDER BY day_order',
      [routineId]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const addDay = ({ id, routineId, label, dayOrder }) => {
  try {
    return db.runSync(
      'INSERT INTO routine_days (id, routine_id, label, day_order) VALUES (?, ?, ?, ?)',
      [id, routineId, label, dayOrder]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const deleteDay = (id) => {
  try {
    return db.runSync('DELETE FROM routine_days WHERE id = ?', [id]);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getExercisesForDay = (dayId) => {
  try {
    return db.getAllSync(
      `SELECT re.*, e.name, e.category FROM routine_exercises re
       JOIN exercises e ON re.exercise_id = e.id
       WHERE re.day_id = ? ORDER BY re.exercise_order`,
      [dayId]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const addExerciseToDay = ({ id, dayId, exerciseId, targetSets, targetReps, exerciseOrder }) => {
  try {
    return db.runSync(
      `INSERT INTO routine_exercises 
       (id, day_id, exercise_id, target_sets, target_reps, exercise_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, dayId, exerciseId, targetSets || 3, targetReps || '8-12', exerciseOrder]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const removeExerciseFromDay = (id) => {
  try {
    return db.runSync('DELETE FROM routine_exercises WHERE id = ?', [id]);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};
