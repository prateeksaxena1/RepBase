import db from './schema';

export const getAllExercises = () => {
  try {
    return db.getAllSync('SELECT * FROM exercises ORDER BY category, muscle_group, name');
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getExercisesByCategory = (category) => {
  try {
    return db.getAllSync('SELECT * FROM exercises WHERE category = ? ORDER BY muscle_group, name', [category]);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getExercisesByMuscle = (muscleGroup) => {
  try {
    return db.getAllSync('SELECT * FROM exercises WHERE muscle_group = ? ORDER BY name', [muscleGroup]);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getExercisesByEquipment = (equipment) => {
  try {
    return db.getAllSync('SELECT * FROM exercises WHERE equipment = ? ORDER BY name', [equipment]);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const searchExercises = (query) => {
  try {
    return db.getAllSync(
      'SELECT * FROM exercises WHERE name LIKE ? OR muscle_group LIKE ? ORDER BY name',
      [`%${query}%`, `%${query}%`]
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const createExercise = ({ id, name, category, muscleGroup, equipment, instructions }) => {
  try {
    return db.runSync(
      `INSERT INTO exercises (id, name, category, muscle_group, equipment, instructions, is_custom)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [id, name, category, muscleGroup || '', equipment || '', instructions || '']
    );
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export const getExerciseById = (id) => {
  try {
    return db.getFirstSync('SELECT * FROM exercises WHERE id = ?', [id]);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};
