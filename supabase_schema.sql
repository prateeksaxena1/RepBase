-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ROUTINES
CREATE TABLE IF NOT EXISTS routines (
  id          UUID PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own routines"
  ON routines FOR ALL USING (auth.uid() = user_id);

-- ROUTINE DAYS
CREATE TABLE IF NOT EXISTS routine_days (
  id          UUID PRIMARY KEY,
  routine_id  UUID REFERENCES routines(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  day_order   INTEGER NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE routine_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own routine days"
  ON routine_days FOR ALL USING (auth.uid() = user_id);

-- ROUTINE EXERCISES
CREATE TABLE IF NOT EXISTS routine_exercises (
  id              UUID PRIMARY KEY,
  day_id          UUID REFERENCES routine_days(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id     TEXT NOT NULL,
  target_sets     INTEGER,
  target_reps     TEXT,
  exercise_order  INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own routine exercises"
  ON routine_exercises FOR ALL USING (auth.uid() = user_id);

-- SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id    UUID REFERENCES routines(id),
  date          DATE NOT NULL,
  notes         TEXT,
  duration_secs INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions"
  ON sessions FOR ALL USING (auth.uid() = user_id);

-- SESSION SETS
CREATE TABLE IF NOT EXISTS session_sets (
  id               UUID PRIMARY KEY,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id       UUID REFERENCES sessions(id) ON DELETE CASCADE,
  exercise_id      TEXT NOT NULL,
  set_number       INTEGER NOT NULL,
  weight_kg        REAL,
  reps             INTEGER,
  set_type         TEXT DEFAULT 'normal',
  rpe              INTEGER,
  is_personal_best BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE session_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own session sets"
  ON session_sets FOR ALL USING (auth.uid() = user_id);

-- FOOD LOGS
CREATE TABLE IF NOT EXISTS food_logs (
  id          UUID PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id     TEXT NOT NULL,
  date        DATE NOT NULL,
  meal_type   TEXT NOT NULL,
  servings    REAL DEFAULT 1,
  calories    REAL DEFAULT 0,
  protein     REAL DEFAULT 0,
  carbs       REAL DEFAULT 0,
  fat         REAL DEFAULT 0,
  fiber       REAL DEFAULT 0,
  sugar       REAL DEFAULT 0,
  sodium      REAL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own food logs"
  ON food_logs FOR ALL USING (auth.uid() = user_id);

-- AUTO CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::TEXT, 8)),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- WEIGHT LOGS
CREATE TABLE IF NOT EXISTS weight_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight     NUMERIC NOT NULL,
  unit       TEXT NOT NULL CHECK (unit IN ('lb', 'kg')),
  logged_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  note       TEXT
);
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own weight logs" ON weight_logs;
CREATE POLICY "Users manage own weight logs"
  ON weight_logs FOR ALL USING (auth.uid() = user_id);

-- BODY MEASUREMENTS
CREATE TABLE IF NOT EXISTS body_measurements (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  waist      NUMERIC,
  chest      NUMERIC,
  arms       NUMERIC,
  thighs     NUMERIC,
  hips       NUMERIC,
  logged_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own body measurements" ON body_measurements;
CREATE POLICY "Users manage own body measurements"
  ON body_measurements FOR ALL USING (auth.uid() = user_id);

