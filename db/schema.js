import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('repbase.db');

export const initDB = () => {
  try {
    db.execSync(`PRAGMA journal_mode = WAL;`);

    db.execSync('DROP TABLE IF EXISTS session_sets');
    db.execSync('DROP TABLE IF EXISTS sessions');
    db.execSync('DROP TABLE IF EXISTS routine_exercises');
    db.execSync('DROP TABLE IF EXISTS routine_days');
    db.execSync('DROP TABLE IF EXISTS routines');
    db.execSync('DROP TABLE IF EXISTS exercises');

    db.execSync(`CREATE TABLE IF NOT EXISTS exercises (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      category     TEXT NOT NULL,
      muscle_group TEXT NOT NULL DEFAULT '',
      equipment    TEXT NOT NULL DEFAULT '',
      instructions TEXT NOT NULL DEFAULT '',
      is_custom    INTEGER DEFAULT 0,
      created_at   TEXT DEFAULT (datetime('now'))
    );`);

    db.execSync(`CREATE TABLE IF NOT EXISTS routines (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      is_active   INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now'))
    );`);

    db.execSync(`CREATE TABLE IF NOT EXISTS routine_days (
      id         TEXT PRIMARY KEY,
      routine_id TEXT NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
      label      TEXT NOT NULL,
      day_order  INTEGER NOT NULL
    );`);

    db.execSync(`CREATE TABLE IF NOT EXISTS routine_exercises (
      id             TEXT PRIMARY KEY,
      day_id         TEXT NOT NULL REFERENCES routine_days(id) ON DELETE CASCADE,
      exercise_id    TEXT NOT NULL REFERENCES exercises(id),
      target_sets    INTEGER,
      target_reps    TEXT,
      exercise_order INTEGER NOT NULL
    );`);

    db.execSync(`DROP TABLE IF EXISTS session_sets;`);
    db.execSync(`DROP TABLE IF EXISTS sessions;`);

    db.execSync(`CREATE TABLE IF NOT EXISTS sessions (
      id            TEXT PRIMARY KEY,
      routine_id    TEXT REFERENCES routines(id),
      date          TEXT NOT NULL,
      notes         TEXT,
      duration_secs INTEGER DEFAULT NULL
    );`);

    db.execSync(`CREATE TABLE IF NOT EXISTS session_sets (
      id               TEXT PRIMARY KEY,
      session_id       TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      exercise_id      TEXT NOT NULL REFERENCES exercises(id),
      set_number       INTEGER NOT NULL,
      weight_kg        REAL,
      reps             INTEGER,
      is_personal_best INTEGER DEFAULT 0
    );`);
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

export default db;
