-- ============================================================
-- RepBase Social Seed — run this in Supabase SQL Editor
-- ============================================================

-- 1) Ensure social tables exist
CREATE TABLE IF NOT EXISTS follows (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all follows" ON follows;
CREATE POLICY "Users can view all follows" ON follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own follows" ON follows;
CREATE POLICY "Users can manage own follows" ON follows FOR ALL USING (auth.uid() = follower_id);

CREATE TABLE IF NOT EXISTS workout_posts (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  caption    TEXT,
  is_public  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE workout_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public posts are viewable by all" ON workout_posts;
CREATE POLICY "Public posts are viewable by all" ON workout_posts FOR SELECT USING (is_public = true);
DROP POLICY IF EXISTS "Users can manage own posts" ON workout_posts;
CREATE POLICY "Users can manage own posts" ON workout_posts FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS likes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id    UUID REFERENCES workout_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Likes are viewable by all" ON likes;
CREATE POLICY "Likes are viewable by all" ON likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own likes" ON likes;
CREATE POLICY "Users can manage own likes" ON likes FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS comments (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id    UUID REFERENCES workout_posts(id) ON DELETE CASCADE NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comments are viewable by all" ON comments;
CREATE POLICY "Comments are viewable by all" ON comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own comments" ON comments;
CREATE POLICY "Users can manage own comments" ON comments FOR ALL USING (auth.uid() = user_id);

-- 2) Seed fake profiles (using your real user ID as reference)
DO $$
DECLARE
  real_uid UUID := '23a6f032-ae93-4bae-8417-178f35ee5389';
  u1 UUID := gen_random_uuid();
  u2 UUID := gen_random_uuid();
  u3 UUID := gen_random_uuid();
  u4 UUID := gen_random_uuid();
  u5 UUID := gen_random_uuid();
  -- routine IDs
  r1 UUID; r2 UUID; r3 UUID; r4 UUID; r5 UUID;
  -- session IDs
  s1 UUID; s2 UUID; s3 UUID; s4 UUID; s5 UUID;
  s6 UUID; s7 UUID; s8 UUID; s9 UUID; s10 UUID;
  -- post IDs
  p1 UUID; p2 UUID; p3 UUID; p4 UUID; p5 UUID;
  p6 UUID; p7 UUID; p8 UUID; p9 UUID; p10 UUID;
BEGIN
  -- Create fake auth users
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
  VALUES
    (u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'arjun.lifts@example.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"username":"arjun_lifts"}'::jsonb, NOW(), NOW(), '', ''),
    (u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'neha.fit@example.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"username":"neha_fit"}'::jsonb, NOW(), NOW(), '', ''),
    (u3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rahul.grind@example.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"username":"rahul_grind"}'::jsonb, NOW(), NOW(), '', ''),
    (u4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya.strong@example.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"username":"priya_strong"}'::jsonb, NOW(), NOW(), '', ''),
    (u5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'karan.muscle@example.com', crypt('TestPass123!', gen_salt('bf')), NOW(), '{"username":"karan_muscle"}'::jsonb, NOW(), NOW(), '', '')
  ON CONFLICT (id) DO NOTHING;

  -- Create identities for each user
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), u1, u1::text, jsonb_build_object('sub', u1::text, 'email', 'arjun.lifts@example.com'), 'email', NOW(), NOW(), NOW()),
    (gen_random_uuid(), u2, u2::text, jsonb_build_object('sub', u2::text, 'email', 'neha.fit@example.com'), 'email', NOW(), NOW(), NOW()),
    (gen_random_uuid(), u3, u3::text, jsonb_build_object('sub', u3::text, 'email', 'rahul.grind@example.com'), 'email', NOW(), NOW(), NOW()),
    (gen_random_uuid(), u4, u4::text, jsonb_build_object('sub', u4::text, 'email', 'priya.strong@example.com'), 'email', NOW(), NOW(), NOW()),
    (gen_random_uuid(), u5, u5::text, jsonb_build_object('sub', u5::text, 'email', 'karan.muscle@example.com'), 'email', NOW(), NOW(), NOW())
  ON CONFLICT DO NOTHING;

  -- Profiles
  INSERT INTO profiles (id, username, full_name, bio) VALUES
    (real_uid, 'prateek', 'Prateek Saxena', 'Chasing PRs 🏋️ | PPL Split'),
    (u1, 'arjun_lifts', 'Arjun Patel', 'Powerlifting enthusiast 🏋️ | 500kg total club'),
    (u2, 'neha_fit', 'Neha Sharma', 'CrossFit athlete & yoga lover 🧘‍♀️'),
    (u3, 'rahul_grind', 'Rahul Verma', 'No shortcuts 💪 | PPL 6 days'),
    (u4, 'priya_strong', 'Priya Gupta', 'Strongwoman competitor | Deadlift queen 👑'),
    (u5, 'karan_muscle', 'Karan Singh', 'Bodybuilding lifestyle 🔱 | Prep coach')
  ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, full_name = EXCLUDED.full_name, bio = EXCLUDED.bio;

  -- Routines (one per fake user)
  r1 := gen_random_uuid(); r2 := gen_random_uuid(); r3 := gen_random_uuid();
  r4 := gen_random_uuid(); r5 := gen_random_uuid();

  INSERT INTO routines (id, user_id, name, description, is_active) VALUES
    (r1, u1, 'Push', 'Chest & Shoulders', true),
    (r2, u2, 'Pull', 'Back & Biceps', true),
    (r3, u3, 'Legs', 'Quads & Hams', true),
    (r4, u4, 'Upper', 'Upper body day', true),
    (r5, u5, 'Push', 'Chest & Triceps', true)
  ON CONFLICT (id) DO NOTHING;

  -- Sessions
  s1:=gen_random_uuid(); s2:=gen_random_uuid(); s3:=gen_random_uuid();
  s4:=gen_random_uuid(); s5:=gen_random_uuid(); s6:=gen_random_uuid();
  s7:=gen_random_uuid(); s8:=gen_random_uuid(); s9:=gen_random_uuid();
  s10:=gen_random_uuid();

  INSERT INTO sessions (id, user_id, routine_id, date, notes, duration_secs) VALUES
    (s1, u1, r1, '2026-05-08', 'Bench PR 100kg!', 3600),
    (s2, u1, r1, '2026-05-10', 'Solid push session', 3200),
    (s3, u2, r2, '2026-05-07', 'Back pump was crazy', 2800),
    (s4, u2, r2, '2026-05-09', 'Light pull day', 3000),
    (s5, u3, r3, '2026-05-06', 'Squat PR 140kg!', 4200),
    (s6, u3, r3, '2026-05-09', 'Leg day grind', 3800),
    (s7, u4, r4, '2026-05-07', 'Upper body blast', 3400),
    (s8, u4, r4, '2026-05-10', 'Morning session', 3100),
    (s9, u5, r5, '2026-05-08', 'Chest & tris', 3300),
    (s10, u5, r5, '2026-05-10', 'Feeling strong today', 3500)
  ON CONFLICT (id) DO NOTHING;

  -- Session sets (a few per session)
  INSERT INTO session_sets (id, user_id, session_id, exercise_id, set_number, weight_kg, reps, set_type) VALUES
    (gen_random_uuid(), u1, s1, 'barbell-bench-press', 1, 90, 6, 'normal'),
    (gen_random_uuid(), u1, s1, 'barbell-bench-press', 2, 95, 5, 'normal'),
    (gen_random_uuid(), u1, s1, 'barbell-bench-press', 3, 100, 3, 'normal'),
    (gen_random_uuid(), u1, s1, 'overhead-press', 4, 55, 8, 'normal'),
    (gen_random_uuid(), u1, s2, 'barbell-bench-press', 1, 85, 8, 'normal'),
    (gen_random_uuid(), u1, s2, 'overhead-press', 2, 50, 10, 'normal'),
    (gen_random_uuid(), u2, s3, 'barbell-row', 1, 80, 8, 'normal'),
    (gen_random_uuid(), u2, s3, 'barbell-row', 2, 85, 6, 'normal'),
    (gen_random_uuid(), u2, s3, 'lat-pulldown', 3, 65, 10, 'normal'),
    (gen_random_uuid(), u2, s4, 'barbell-row', 1, 70, 10, 'normal'),
    (gen_random_uuid(), u2, s4, 'barbell-curl', 2, 35, 12, 'normal'),
    (gen_random_uuid(), u3, s5, 'squat', 1, 120, 5, 'normal'),
    (gen_random_uuid(), u3, s5, 'squat', 2, 130, 4, 'normal'),
    (gen_random_uuid(), u3, s5, 'squat', 3, 140, 2, 'normal'),
    (gen_random_uuid(), u3, s5, 'leg-press', 4, 200, 10, 'normal'),
    (gen_random_uuid(), u3, s6, 'squat', 1, 110, 8, 'normal'),
    (gen_random_uuid(), u3, s6, 'leg-curl', 2, 50, 12, 'normal'),
    (gen_random_uuid(), u4, s7, 'barbell-bench-press', 1, 75, 10, 'normal'),
    (gen_random_uuid(), u4, s7, 'barbell-row', 2, 70, 8, 'normal'),
    (gen_random_uuid(), u4, s8, 'overhead-press', 1, 45, 10, 'normal'),
    (gen_random_uuid(), u4, s8, 'lat-pulldown', 2, 55, 12, 'normal'),
    (gen_random_uuid(), u5, s9, 'barbell-bench-press', 1, 95, 6, 'normal'),
    (gen_random_uuid(), u5, s9, 'tricep-pushdown', 2, 30, 15, 'normal'),
    (gen_random_uuid(), u5, s10, 'barbell-bench-press', 1, 100, 5, 'normal'),
    (gen_random_uuid(), u5, s10, 'overhead-press', 2, 60, 8, 'normal');

  -- Workout posts
  p1:=gen_random_uuid(); p2:=gen_random_uuid(); p3:=gen_random_uuid();
  p4:=gen_random_uuid(); p5:=gen_random_uuid(); p6:=gen_random_uuid();
  p7:=gen_random_uuid(); p8:=gen_random_uuid(); p9:=gen_random_uuid();
  p10:=gen_random_uuid();

  INSERT INTO workout_posts (id, user_id, session_id, caption, is_public) VALUES
    (p1, u1, s1, 'Finally hit 100kg bench! 🔥💪', true),
    (p2, u1, s2, 'Solid push day, consistency wins', true),
    (p3, u2, s3, 'Back pump was INSANE today 🦍', true),
    (p4, u2, s4, 'Easy pull day, recovery mode', true),
    (p5, u3, s5, 'SQUAT PR 140KG!!! 🏆🔥', true),
    (p6, u3, s6, 'Leg day grind never stops', true),
    (p7, u4, s7, 'Upper body blast! Love morning sessions ☀️', true),
    (p8, u4, s8, 'Quick session before work', true),
    (p9, u5, s9, 'Chest & tris pump 💪', true),
    (p10, u5, s10, 'Feeling strong going into the weekend!', true);

  -- Follows (everyone follows each other + real user)
  INSERT INTO follows (id, follower_id, following_id) VALUES
    -- fake users follow real user
    (gen_random_uuid(), u1, real_uid),
    (gen_random_uuid(), u2, real_uid),
    (gen_random_uuid(), u3, real_uid),
    (gen_random_uuid(), u4, real_uid),
    (gen_random_uuid(), u5, real_uid),
    -- real user follows fake users
    (gen_random_uuid(), real_uid, u1),
    (gen_random_uuid(), real_uid, u2),
    (gen_random_uuid(), real_uid, u3),
    (gen_random_uuid(), real_uid, u4),
    (gen_random_uuid(), real_uid, u5),
    -- cross follows
    (gen_random_uuid(), u1, u2), (gen_random_uuid(), u2, u1),
    (gen_random_uuid(), u1, u3), (gen_random_uuid(), u3, u1),
    (gen_random_uuid(), u2, u4), (gen_random_uuid(), u4, u2),
    (gen_random_uuid(), u3, u5), (gen_random_uuid(), u5, u3)
  ON CONFLICT DO NOTHING;

  -- Likes
  INSERT INTO likes (id, user_id, post_id) VALUES
    (gen_random_uuid(), real_uid, p1),
    (gen_random_uuid(), real_uid, p5),
    (gen_random_uuid(), u1, p3), (gen_random_uuid(), u1, p5),
    (gen_random_uuid(), u2, p1), (gen_random_uuid(), u2, p5), (gen_random_uuid(), u2, p9),
    (gen_random_uuid(), u3, p1), (gen_random_uuid(), u3, p7),
    (gen_random_uuid(), u4, p5), (gen_random_uuid(), u4, p6), (gen_random_uuid(), u4, p10),
    (gen_random_uuid(), u5, p1), (gen_random_uuid(), u5, p3), (gen_random_uuid(), u5, p5)
  ON CONFLICT DO NOTHING;

  -- Comments
  INSERT INTO comments (id, user_id, post_id, content) VALUES
    (gen_random_uuid(), u2, p1, 'Beast mode! 🔥'),
    (gen_random_uuid(), u3, p1, 'Strong lift bro!'),
    (gen_random_uuid(), real_uid, p1, 'Goals! 💪'),
    (gen_random_uuid(), u1, p5, 'Insane squat PR! 🏆'),
    (gen_random_uuid(), u4, p5, 'You make it look easy'),
    (gen_random_uuid(), u5, p5, 'Respect the grind 🫡'),
    (gen_random_uuid(), u1, p3, 'Back day is best day'),
    (gen_random_uuid(), u3, p7, 'Morning sessions hit different ☀️'),
    (gen_random_uuid(), u2, p9, 'Chest pump looking good!'),
    (gen_random_uuid(), real_uid, p10, 'Keep it up! 💪');

  RAISE NOTICE 'Seed complete! Users: %, %, %, %, %', u1, u2, u3, u4, u5;
END $$;

-- 3) Reload PostgREST schema cache so it picks up new FKs
NOTIFY pgrst, 'reload schema';
