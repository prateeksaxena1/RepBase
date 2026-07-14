import { supabase } from '../lib/supabase';

/**
 * Log a new weight entry.
 * Inserts the weight log record for tracking user weight progression.
 */
export const logWeight = async (userId, weight, unit, note) => {
  try {
    const { data, error } = await supabase
      .from('weight_logs')
      .insert({
        user_id: userId,
        weight,
        unit,
        note,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

/**
 * Retrieve weight logs in descending order.
 * Helps fetch chronological logs to plot or display user weight changes.
 */
export const getWeightHistory = async (userId, limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return [];
  }
};

/**
 * Log new body circumference measurements.
 * Captures various body dimension metrics (chest, waist, etc.) for physical tracking.
 */
export const logMeasurement = async (userId, measurements) => {
  try {
    const { data, error } = await supabase
      .from('body_measurements')
      .insert({
        user_id: userId,
        waist: measurements.waist,
        chest: measurements.chest,
        arms: measurements.arms,
        thighs: measurements.thighs,
        hips: measurements.hips,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};

/**
 * Retrieve the single most recent body measurements record.
 * Used to display current circumference stats on the progress dashboard.
 */
export const getLatestMeasurements = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('[RepBase DB Error]', error);
    return null;
  }
};
