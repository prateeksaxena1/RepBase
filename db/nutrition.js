import db from './schema';
import axios from 'axios';

// ─── FOODS ───────────────────────────
export const searchFoodsLocal = (query) => {
  try {
    return db.getAllSync(
      `SELECT * FROM foods WHERE name LIKE ? OR brand LIKE ?
       ORDER BY is_custom DESC, name ASC LIMIT 30`,
      [`%${query}%`, `%${query}%`]
    );
  } catch (e) { console.error('[DB]', e); return []; }
};

export const getFoodByBarcode = (barcode) => {
  try {
    return db.getFirstSync(
      'SELECT * FROM foods WHERE barcode = ?', [barcode]
    );
  } catch (e) { console.error('[DB]', e); return null; }
};

export const createFood = (food) => {
  try {
    db.runSync(
      `INSERT INTO foods
       (id, name, brand, barcode, serving_size, serving_unit,
        calories, protein, carbs, fat, fiber, sugar, sodium, is_custom)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [food.id, food.name, food.brand || '',
       food.barcode || '', food.serving_size || 100,
       food.serving_unit || 'g', food.calories || 0,
       food.protein || 0, food.carbs || 0, food.fat || 0,
       food.fiber || 0, food.sugar || 0, food.sodium || 0,
       food.is_custom || 0]
    );
  } catch (e) { console.error('[DB]', e); }
};

// ─── FOOD LOGS ───────────────────────
export const getFoodLogsForDate = (date) => {
  try {
    return db.getAllSync(
      `SELECT fl.*, f.name as food_name, f.brand,
       f.serving_unit, f.serving_size as food_serving_size
       FROM food_logs fl
       JOIN foods f ON fl.food_id = f.id
       WHERE fl.date = ?
       ORDER BY fl.meal_type, fl.created_at ASC`,
      [date]
    );
  } catch (e) { console.error('[DB]', e); return []; }
};

export const logFood = ({ id, foodId, date, mealType,
  servings, calories, protein, carbs, fat, fiber, sugar, sodium }) => {
  try {
    db.runSync(
      `INSERT INTO food_logs
       (id, food_id, date, meal_type, servings,
        calories, protein, carbs, fat, fiber, sugar, sodium)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, foodId, date, mealType, servings,
       calories, protein, carbs, fat, fiber, sugar, sodium]
    );
  } catch (e) { console.error('[DB]', e); }
};

export const deleteFoodLog = (id) => {
  try {
    db.runSync('DELETE FROM food_logs WHERE id = ?', [id]);
  } catch (e) { console.error('[DB]', e); }
};

export const getDailyTotals = (date) => {
  try {
    return db.getFirstSync(
      `SELECT
       ROUND(SUM(calories), 1) as calories,
       ROUND(SUM(protein), 1)  as protein,
       ROUND(SUM(carbs), 1)    as carbs,
       ROUND(SUM(fat), 1)      as fat,
       ROUND(SUM(fiber), 1)    as fiber,
       ROUND(SUM(sugar), 1)    as sugar,
       ROUND(SUM(sodium), 1)   as sodium
       FROM food_logs WHERE date = ?`,
      [date]
    );
  } catch (e) { console.error('[DB]', e); return null; }
};

// ─── NUTRITION GOALS ─────────────────
export const getNutritionGoals = () => {
  try {
    return db.getFirstSync('SELECT * FROM nutrition_goals LIMIT 1');
  } catch (e) { console.error('[DB]', e); return null; }
};

export const saveNutritionGoals = (goals) => {
  try {
    const existing = db.getFirstSync(
      'SELECT id FROM nutrition_goals LIMIT 1'
    );
    if (existing) {
      db.runSync(
        `UPDATE nutrition_goals SET calories=?, protein=?,
         carbs=?, fat=?, fiber=?, sugar=?, sodium=?, water_ml=?
         WHERE id=?`,
        [goals.calories, goals.protein, goals.carbs, goals.fat,
         goals.fiber, goals.sugar, goals.sodium,
         goals.water_ml, existing.id]
      );
    } else {
      const Crypto = require('expo-crypto');
      db.runSync(
        `INSERT INTO nutrition_goals
         (id, calories, protein, carbs, fat, fiber, sugar, sodium, water_ml)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [Crypto.randomUUID(), goals.calories, goals.protein,
         goals.carbs, goals.fat, goals.fiber, goals.sugar,
         goals.sodium, goals.water_ml]
      );
    }
  } catch (e) { console.error('[DB]', e); }
};

// ─── WATER ───────────────────────────
export const getWaterForDate = (date) => {
  try {
    const result = db.getFirstSync(
      `SELECT ROUND(SUM(amount_ml), 0) as total
       FROM water_logs WHERE date = ?`,
      [date]
    );
    return result?.total || 0;
  } catch (e) { console.error('[DB]', e); return 0; }
};

export const logWater = ({ id, date, amount_ml }) => {
  try {
    db.runSync(
      'INSERT INTO water_logs (id, date, amount_ml) VALUES (?, ?, ?)',
      [id, date, amount_ml]
    );
  } catch (e) { console.error('[DB]', e); }
};

// ─── OPEN FOOD FACTS API ─────────────
export const searchFoodAPI = async (query) => {
  try {
    const res = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl`,
      { params: {
          search_terms: query,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: 20,
          fields: 'product_name,brands,nutriments,code,serving_size'
        }
      }
    );
    return (res.data.products || []).map((p) => ({
      id: p.code,
      name: p.product_name || 'Unknown',
      brand: p.brands || '',
      barcode: p.code,
      serving_size: parseFloat(p.serving_size) || 100,
      serving_unit: 'g',
      calories: p.nutriments?.['energy-kcal_100g'] || 0,
      protein: p.nutriments?.proteins_100g || 0,
      carbs: p.nutriments?.carbohydrates_100g || 0,
      fat: p.nutriments?.fat_100g || 0,
      fiber: p.nutriments?.fiber_100g || 0,
      sugar: p.nutriments?.sugars_100g || 0,
      sodium: p.nutriments?.sodium_100g
        ? p.nutriments.sodium_100g * 1000 : 0,
    }));
  } catch (e) {
    console.error('[API]', e);
    return [];
  }
};

export const getFoodByBarcodeAPI = async (barcode) => {
  try {
    const res = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const p = res.data.product;
    if (!p) return null;
    return {
      id: barcode,
      name: p.product_name || 'Unknown',
      brand: p.brands || '',
      barcode,
      serving_size: parseFloat(p.serving_size) || 100,
      serving_unit: 'g',
      calories: p.nutriments?.['energy-kcal_100g'] || 0,
      protein: p.nutriments?.proteins_100g || 0,
      carbs: p.nutriments?.carbohydrates_100g || 0,
      fat: p.nutriments?.fat_100g || 0,
      fiber: p.nutriments?.fiber_100g || 0,
      sugar: p.nutriments?.sugars_100g || 0,
      sodium: p.nutriments?.sodium_100g
        ? p.nutriments.sodium_100g * 1000 : 0,
    };
  } catch (e) { console.error('[API]', e); return null; }
};
