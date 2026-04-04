import db from './schema';

export const getAllExercises = () =>
  db.getAllSync('SELECT * FROM exercises ORDER BY category, name');

export const getExercisesByCategory = (category) =>
  db.getAllSync('SELECT * FROM exercises WHERE category = ? ORDER BY name', [category]);

export const createExercise = ({ id, name, category }) =>
  db.runSync(
    'INSERT INTO exercises (id, name, category, is_custom) VALUES (?, ?, ?, 1)',
    [id, name, category]
  );
