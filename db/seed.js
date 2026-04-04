import db from './schema';

export const seedExercises = () => {
  const count = db.getFirstSync('SELECT COUNT(*) as c FROM exercises').c;
  if (count > 0) return;

  const exercises = [
    ['bench-press', 'Bench Press', 'Push'],
    ['incline-press', 'Incline DB Press', 'Push'],
    ['overhead-press', 'Overhead Press', 'Push'],
    ['lateral-raise', 'Lateral Raise', 'Push'],
    ['tricep-pushdown', 'Tricep Pushdown', 'Push'],
    ['chest-fly', 'Cable Chest Fly', 'Push'],
    ['pull-up', 'Pull Up', 'Pull'],
    ['barbell-row', 'Barbell Row', 'Pull'],
    ['lat-pulldown', 'Lat Pulldown', 'Pull'],
    ['face-pull', 'Face Pull', 'Pull'],
    ['barbell-curl', 'Barbell Curl', 'Pull'],
    ['hammer-curl', 'Hammer Curl', 'Pull'],
    ['squat', 'Squat', 'Legs'],
    ['leg-press', 'Leg Press', 'Legs'],
    ['romanian-dl', 'Romanian Deadlift', 'Legs'],
    ['leg-curl', 'Leg Curl', 'Legs'],
    ['calf-raise', 'Calf Raise', 'Legs'],
    ['deadlift', 'Deadlift', 'Full Body'],
    ['plank', 'Plank', 'Full Body'],
  ];

  for (const [id, name, category] of exercises) {
    db.runSync(
      'INSERT INTO exercises (id, name, category) VALUES (?, ?, ?)',
      [id, name, category]
    );
  }
};
