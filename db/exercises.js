import db from './schema';

export const getAllExercises = () =>
  db.getAllSync('SELECT * FROM exercises ORDER BY category, muscle_group, name');

export const getExercisesByCategory = (category) =>
  db.getAllSync('SELECT * FROM exercises WHERE category = ? ORDER BY muscle_group, name', [category]);

export const getExercisesByMuscle = (muscleGroup) =>
  db.getAllSync('SELECT * FROM exercises WHERE muscle_group = ? ORDER BY name', [muscleGroup]);

export const getExercisesByEquipment = (equipment) =>
  db.getAllSync('SELECT * FROM exercises WHERE equipment = ? ORDER BY name', [equipment]);

export const searchExercises = (query) =>
  db.getAllSync(
    'SELECT * FROM exercises WHERE name LIKE ? OR muscle_group LIKE ? ORDER BY name',
    [`%${query}%`, `%${query}%`]
  );

export const createExercise = ({ id, name, category, muscleGroup, equipment, instructions }) =>
  db.runSync(
    `INSERT INTO exercises (id, name, category, muscle_group, equipment, instructions, is_custom)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [id, name, category, muscleGroup || '', equipment || '', instructions || '']
  );

export const getExerciseById = (id) =>
  db.getFirstSync('SELECT * FROM exercises WHERE id = ?', [id]);
