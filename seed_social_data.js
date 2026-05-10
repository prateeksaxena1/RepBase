/**
 * seed_social_data.js
 *
 * Seeds the RepBase Supabase database with sample social data:
 *   - 5 fake user profiles
 *   - Routines & sessions for each user
 *   - Workout posts in the public feed
 *   - Follow relationships (all follow each other)
 *   - Likes & comments on posts
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<your-key> node seed_social_data.js
 *
 * The service-role key is required to bypass RLS.
 * Find it in Supabase Dashboard → Settings → API → service_role (secret).
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const WebSocket = require('ws');

const SUPABASE_URL = 'https://mmgiwxwbjapqlhnslhxk.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  console.error('   Run: SUPABASE_SERVICE_ROLE_KEY=<key> node seed_social_data.js');
  console.error('   Find it in Supabase Dashboard → Settings → API → service_role (secret).');
  process.exit(1);
}

// Admin client (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket },
});

const uuid = () => crypto.randomUUID();

// ── Your real user ──
const REAL_USER_ID = '23a6f032-ae93-4bae-8417-178f35ee5389';

// ── Fake users to create ──
const FAKE_USERS = [
  { email: 'arjun.lifts@example.com',  username: 'arjun_lifts',   fullName: 'Arjun Patel',     bio: 'Powerlifting enthusiast 🏋️ | 500kg total club' },
  { email: 'neha.fit@example.com',      username: 'neha_fit',      fullName: 'Neha Sharma',     bio: 'CrossFit athlete & yoga lover 🧘‍♀️' },
  { email: 'rahul.grind@example.com',   username: 'rahul_grind',   fullName: 'Rahul Verma',     bio: 'No shortcuts 💪 | PPL 6 days a week' },
  { email: 'priya.strong@example.com',  username: 'priya_strong',  fullName: 'Priya Gupta',     bio: 'Strongwoman competitor | Deadlift queen 👑' },
  { email: 'karan.muscle@example.com',  username: 'karan_muscle',  fullName: 'Karan Singh',     bio: 'Bodybuilding lifestyle 🔱 | Prep coach' },
];

const PASSWORD = 'TestPass123!';

// Retry wrapper
async function retry(fn, label, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`  ⏳ Retry ${i + 1}/${retries} for ${label}: ${err.message}`);
      if (i < retries - 1) await sleep(2000 * (i + 1));
      else throw err;
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createOrGetUser(user) {
  return retry(async () => {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { username: user.username },
    });

    if (error) {
      if (error.message?.includes('already been registered') || error.status === 422) {
        // User already exists — find them
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((u) => u.email === user.email);
        if (existing) return existing.id;
        console.warn(`⚠️  Could not find existing user ${user.email}`);
        return null;
      }
      console.error(`❌ Auth error for ${user.email}:`, error.message);
      return null;
    }
    return data.user.id;
  }, `createUser(${user.email})`);
}

async function seed() {
  console.log('🌱 Starting social data seed...\n');

  // Quick connectivity check
  console.log('🔌 Checking Supabase connectivity...');
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    console.log('  ✅ Connected to Supabase\n');
  } catch (e) {
    console.error('  ❌ Cannot reach Supabase:', e.message);
    console.error('  Check your internet connection and try again.');
    process.exit(1);
  }

  // ── Step 1: Create fake users & profiles ──
  console.log('👤 Creating users & profiles...');
  const userIds = [];

  for (const fakeUser of FAKE_USERS) {
    const userId = await createOrGetUser(fakeUser);
    if (!userId) continue;
    userIds.push(userId);

    // Upsert profile
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      username: fakeUser.username,
      full_name: fakeUser.fullName,
      bio: fakeUser.bio,
      avatar_url: null,
    }, { onConflict: 'id' });

    if (profileErr) console.error(`  Profile error (${fakeUser.username}):`, profileErr.message);
    else console.log(`  ✅ ${fakeUser.username} (${userId})`);

    await sleep(300); // pace requests
  }

  // Make sure real user's profile exists
  const { error: realProfileErr } = await supabase.from('profiles').upsert({
    id: REAL_USER_ID,
    username: 'prateek',
    full_name: 'Prateek Saxena',
    bio: 'Chasing PRs 🏋️ | PPL Split | Consistency > Motivation',
  }, { onConflict: 'id' });
  if (realProfileErr) console.error('  Real profile error:', realProfileErr.message);
  else console.log(`  ✅ prateek (real user)`);

  const allUserIds = [REAL_USER_ID, ...userIds];
  console.log(`\n  Total users: ${allUserIds.length}\n`);

  // ── Step 2: Create routines for each fake user ──
  console.log('📋 Creating routines for fake users...');
  const routineMap = {}; // userId -> [{id, name}]

  const routineTemplates = [
    { name: 'Push', description: 'Chest, Shoulders & Triceps' },
    { name: 'Pull', description: 'Back & Biceps' },
    { name: 'Legs', description: 'Quads, Hams & Glutes' },
  ];

  for (const userId of userIds) {
    routineMap[userId] = [];
    const routines = routineTemplates.map((t) => ({
      id: uuid(),
      user_id: userId,
      name: t.name,
      description: t.description,
      is_active: t.name === 'Push',
    }));

    const { error } = await supabase.from('routines').upsert(routines);
    if (error) console.error(`  Routines error for ${userId}:`, error.message);
    else routines.forEach((r) => routineMap[userId].push({ id: r.id, name: r.name }));

    await sleep(200);
  }
  console.log('  ✅ Routines created\n');

  // ── Step 3: Create sessions & sets for each fake user ──
  console.log('🏋️ Creating workout sessions...');
  const allSessions = [];
  const allSets = [];

  const exercisesByRoutine = {
    Push: [
      { id: 'barbell-bench-press', sets: () => [[80 + r(10), 8], [85 + r(10), 6], [85 + r(10), 6], [80 + r(10), 8]] },
      { id: 'overhead-press', sets: () => [[50 + r(10), 8], [52 + r(5), 7], [50 + r(5), 8]] },
      { id: 'tricep-pushdown', sets: () => [[25 + r(10), 12], [27 + r(5), 10], [25 + r(5), 11]] },
    ],
    Pull: [
      { id: 'barbell-row', sets: () => [[70 + r(10), 8], [75 + r(10), 6], [75 + r(5), 6], [70 + r(5), 8]] },
      { id: 'lat-pulldown', sets: () => [[55 + r(10), 10], [60 + r(5), 8], [55 + r(5), 9]] },
      { id: 'barbell-curl', sets: () => [[30 + r(10), 12], [32 + r(5), 10], [30 + r(5), 11]] },
    ],
    Legs: [
      { id: 'squat', sets: () => [[100 + r(20), 6], [105 + r(15), 5], [110 + r(15), 4], [100 + r(10), 6]] },
      { id: 'leg-press', sets: () => [[180 + r(30), 12], [200 + r(20), 10], [180 + r(20), 11]] },
      { id: 'leg-curl', sets: () => [[40 + r(10), 12], [45 + r(5), 10], [40 + r(5), 11]] },
    ],
  };

  function r(max) { return Math.floor(Math.random() * max); }

  const dates = ['2026-05-03', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-10'];
  const captions = [
    'Crushed it today! 💪',
    'PR on bench! Let\'s go 🔥',
    'Leg day = best day',
    'Back pump was insane today',
    'Consistency is key 🗝️',
    'Light weight baby! 😤',
    'Recovery day tomorrow for sure',
    'New training split working great',
    'Hit a wall today but pushed through',
    'Morning session hits different ☀️',
    'Gym was empty today — had all the racks!',
    'Feeling the progress week over week 📈',
  ];

  for (const userId of userIds) {
    const userRoutines = routineMap[userId] || [];
    if (userRoutines.length === 0) continue;

    // Each user gets 3-5 sessions
    const numSessions = 3 + r(3);
    const shuffledDates = [...dates].sort(() => Math.random() - 0.5).slice(0, numSessions);

    for (const date of shuffledDates) {
      const routine = userRoutines[r(userRoutines.length)];
      const sessionId = uuid();
      const duration = 2400 + r(2400); // 40-80 min

      allSessions.push({
        id: sessionId,
        user_id: userId,
        routine_id: routine.id,
        date,
        notes: captions[r(captions.length)],
        duration_secs: duration,
      });

      // Build sets
      const exercises = exercisesByRoutine[routine.name] || exercisesByRoutine['Push'];
      let setNum = 1;
      for (const ex of exercises) {
        for (const [weight, reps] of ex.sets()) {
          allSets.push({
            id: uuid(),
            user_id: userId,
            session_id: sessionId,
            exercise_id: ex.id,
            set_number: setNum++,
            weight_kg: weight,
            reps,
            set_type: 'normal',
            rpe: null,
            is_personal_best: false,
          });
        }
      }
    }
  }

  // Insert sessions
  const { error: sessErr } = await supabase.from('sessions').upsert(allSessions);
  if (sessErr) console.error('  Sessions error:', sessErr.message);
  else console.log(`  ✅ ${allSessions.length} sessions created`);

  await sleep(500);

  // Insert sets (in batches of 50)
  for (let i = 0; i < allSets.length; i += 50) {
    const batch = allSets.slice(i, i + 50);
    const { error } = await supabase.from('session_sets').upsert(batch);
    if (error) console.error(`  Sets batch ${i} error:`, error.message);
    await sleep(200);
  }
  console.log(`  ✅ ${allSets.length} session sets created\n`);

  // ── Step 4: Create workout posts ──
  console.log('📝 Creating workout posts...');
  const allPosts = [];

  for (const session of allSessions) {
    const postId = uuid();
    allPosts.push({
      id: postId,
      user_id: session.user_id,
      session_id: session.id,
      caption: captions[r(captions.length)],
      is_public: true,
    });
  }

  const { error: postErr } = await supabase.from('workout_posts').upsert(allPosts);
  if (postErr) console.error('  Posts error:', postErr.message);
  else console.log(`  ✅ ${allPosts.length} workout posts created\n`);

  await sleep(500);

  // ── Step 5: Create follow relationships ──
  console.log('🤝 Creating follow relationships...');
  const follows = [];

  // All fake users follow the real user
  for (const userId of userIds) {
    follows.push({
      id: uuid(),
      follower_id: userId,
      following_id: REAL_USER_ID,
    });
  }

  // Real user follows all fake users
  for (const userId of userIds) {
    follows.push({
      id: uuid(),
      follower_id: REAL_USER_ID,
      following_id: userId,
    });
  }

  // Fake users follow each other (random pairs)
  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      if (Math.random() > 0.4) {
        follows.push({ id: uuid(), follower_id: userIds[i], following_id: userIds[j] });
        follows.push({ id: uuid(), follower_id: userIds[j], following_id: userIds[i] });
      }
    }
  }

  const { error: followErr } = await supabase.from('follows').upsert(follows);
  if (followErr) console.error('  Follows error:', followErr.message);
  else console.log(`  ✅ ${follows.length} follow relationships created\n`);

  await sleep(500);

  // ── Step 6: Create likes on posts ──
  console.log('❤️  Creating likes...');
  const likes = [];

  for (const post of allPosts) {
    // Random users like each post
    const likers = allUserIds.filter(() => Math.random() > 0.4);
    for (const likerId of likers) {
      if (likerId === post.user_id && Math.random() > 0.5) continue;
      likes.push({
        id: uuid(),
        user_id: likerId,
        post_id: post.id,
      });
    }
  }

  // Deduplicate (user_id, post_id)
  const uniqueLikes = [];
  const likeSet = new Set();
  for (const like of likes) {
    const key = `${like.user_id}-${like.post_id}`;
    if (!likeSet.has(key)) {
      likeSet.add(key);
      uniqueLikes.push(like);
    }
  }

  // Insert likes in batches
  for (let i = 0; i < uniqueLikes.length; i += 50) {
    const batch = uniqueLikes.slice(i, i + 50);
    const { error } = await supabase.from('likes').upsert(batch);
    if (error) console.error(`  Likes batch ${i} error:`, error.message);
    await sleep(200);
  }
  console.log(`  ✅ ${uniqueLikes.length} likes created\n`);

  // ── Step 7: Create comments ──
  console.log('💬 Creating comments...');
  const commentTexts = [
    'Beast mode! 🔥', 'Strong lift!', 'Keep it up 💪',
    'Goals! 🎯', 'Insane progress', 'How long have you been training?',
    'Love the consistency!', 'Need to try this routine',
    'That volume is crazy!', 'PR chaser! 🏆',
    'Respect the grind 🫡', 'You make it look easy',
    'Training inspo right here', 'What a session!',
    'Let\'s hit a workout together soon!',
  ];

  const comments = [];
  for (const post of allPosts) {
    const numComments = r(4); // 0–3 comments per post
    const commenters = allUserIds
      .filter((id) => id !== post.user_id)
      .sort(() => Math.random() - 0.5)
      .slice(0, numComments);

    for (const commenterId of commenters) {
      comments.push({
        id: uuid(),
        user_id: commenterId,
        post_id: post.id,
        content: commentTexts[r(commentTexts.length)],
      });
    }
  }

  // Insert comments in batches
  for (let i = 0; i < comments.length; i += 50) {
    const batch = comments.slice(i, i + 50);
    const { error } = await supabase.from('comments').upsert(batch);
    if (error) console.error(`  Comments batch ${i} error:`, error.message);
    await sleep(200);
  }
  console.log(`  ✅ ${comments.length} comments created\n`);

  // ── Summary ──
  console.log('═══════════════════════════════════════');
  console.log('🎉 Social seed complete!');
  console.log(`   👤 ${userIds.length} fake users + 1 real user`);
  console.log(`   📋 ${userIds.length * 3} routines`);
  console.log(`   🏋️ ${allSessions.length} sessions`);
  console.log(`   💪 ${allSets.length} sets`);
  console.log(`   📝 ${allPosts.length} workout posts`);
  console.log(`   🤝 ${follows.length} follows`);
  console.log(`   ❤️  ${uniqueLikes.length} likes`);
  console.log(`   💬 ${comments.length} comments`);
  console.log('═══════════════════════════════════════');
}

seed().catch((err) => {
  console.error('💥 Seed failed:', err);
  process.exit(1);
});
