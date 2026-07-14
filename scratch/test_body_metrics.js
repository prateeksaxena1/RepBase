import { supabase } from '../lib/supabase';
import { logWeight, getWeightHistory, logMeasurement, getLatestMeasurements } from '../db/bodyMetrics';

const email = 'arjun.lifts@example.com';
const password = 'TestPass123!';

const runTest = async () => {
  console.log('🧪 Starting Body Metrics Verification Test...');

  // 1. Sign in as test user
  console.log(`🔐 Authenticating as ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('❌ Authentication failed:', authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log('✅ Authenticated successfully. User ID:', userId);

  // 2. Test Weight Logging
  console.log('\n⚖️ Testing weight logging...');
  const weight = 82.5;
  const unit = 'kg';
  const note = 'Morning weight, feeling good';
  const newWeightLog = await logWeight(userId, weight, unit, note);
  
  if (newWeightLog) {
    console.log('✅ Weight logged successfully:', newWeightLog);
  } else {
    console.error('❌ Failed to log weight');
  }

  // 3. Test Weight History Retrieval
  console.log('\n📈 Testing weight history retrieval...');
  const history = await getWeightHistory(userId, 5);
  console.log(`✅ Retrieved ${history.length} history items:`, history);

  // 4. Test Body Measurement Logging
  console.log('\n📏 Testing body measurements logging...');
  const measurements = {
    waist: 82.0,
    chest: 104.5,
    arms: 38.0,
    thighs: 58.5,
    hips: 96.0,
  };
  const newMeasurement = await logMeasurement(userId, measurements);

  if (newMeasurement) {
    console.log('✅ Measurement logged successfully:', newMeasurement);
  } else {
    console.error('❌ Failed to log measurement');
  }

  // 5. Test Latest Measurements Retrieval
  console.log('\n🔍 Testing latest measurements retrieval...');
  const latest = await getLatestMeasurements(userId);
  console.log('✅ Retrieved latest measurements:', latest);

  console.log('\n🏁 Verification test finished!');
};

runTest().catch((err) => {
  console.error('💥 Unexpected test error:', err);
});
