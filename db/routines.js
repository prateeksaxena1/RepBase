import db from './schema';

export const getAllRoutines = () => {
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
};

export const getRoutineById = (id) =>
  db.getFirstSync('SELECT * FROM routines WHERE id = ?', [id]);

export const createRoutine = ({ id, name, description }) =>
  db.runSync(
    'INSERT INTO routines (id, name, description, is_active) VALUES (?, ?, ?, 0)',
    [id, name, description || '']
  );

export const updateRoutine = ({ id, name, description }) =>
  db.runSync(
    'UPDATE routines SET name = ?, description = ? WHERE id = ?',
    [name, description || '', id]
  );

export const deleteRoutine = (id) =>
  db.runSync('DELETE FROM routines WHERE id = ?', [id]);

export const setActiveRoutine = (id) => {
  db.runSync('UPDATE routines SET is_active = 0');
  db.runSync('UPDATE routines SET is_active = 1 WHERE id = ?', [id]);
};

export const getDaysForRoutine = (routineId) =>
  db.getAllSync(
    'SELECT * FROM routine_days WHERE routine_id = ? ORDER BY day_order',
    [routineId]
  );

export const addDay = ({ id, routineId, label, dayOrder }) =>
  db.runSync(
    'INSERT INTO routine_days (id, routine_id, label, day_order) VALUES (?, ?, ?, ?)',
    [id, routineId, label, dayOrder]
  );

export const deleteDay = (id) =>
  db.runSync('DELETE FROM routine_days WHERE id = ?', [id]);

export const getExercisesForDay = (dayId) =>
  db.getAllSync(
    `SELECT re.*, e.name, e.category FROM routine_exercises re
     JOIN exercises e ON re.exercise_id = e.id
     WHERE re.day_id = ? ORDER BY re.exercise_order`,
    [dayId]
  );

export const addExerciseToDay = ({ id, dayId, exerciseId, targetSets, targetReps, exerciseOrder }) =>
  db.runSync(
    `INSERT INTO routine_exercises 
     (id, day_id, exercise_id, target_sets, target_reps, exercise_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, dayId, exerciseId, targetSets || 3, targetReps || '8-12', exerciseOrder]
  );

export const removeExerciseFromDay = (id) =>
  db.runSync('DELETE FROM routine_exercises WHERE id = ?', [id]);
