import { View, Text, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../../constants/theme';
import {
  getFoodLogsForDate, getDailyTotals, getNutritionGoals,
  getWaterForDate, logWater, deleteFoodLog
} from '../../db/nutrition';
import FoodSearchModal from '../../components/FoodSearchModal';

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const WATER_PRESETS = [150, 250, 350, 500];

export default function Nutrition() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [logs, setLogs] = useState([]);
  const [totals, setTotals] = useState(null);
  const [goals, setGoals] = useState(null);
  const [water, setWater] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [activeMeal, setActiveMeal] = useState('Breakfast');

  const reload = () => {
    setLoading(true);
    setLogs(getFoodLogsForDate(date));
    setTotals(getDailyTotals(date));
    setGoals(getNutritionGoals());
    setWater(getWaterForDate(date));
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { reload(); }, [date]));

  const handleAddWater = (ml) => {
    logWater({ id: Crypto.randomUUID(), date, amount_ml: ml });
    reload();
  };

  const handleDeleteLog = (id) => {
    Alert.alert('Remove food?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive',
        onPress: () => { deleteFoodLog(id); reload(); } },
    ]);
  };

  const MacroBar = ({ label, current, goal, color }) => {
    const pct = goal ? Math.min((current || 0) / goal, 1) : 0;
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row',
          justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: colors.muted,
            fontSize: 9, textTransform: 'uppercase',
            letterSpacing: 0.5 }}>{label}</Text>
          <Text style={{ color: colors.white,
            fontSize: 9, fontWeight: '700' }}>
            {Math.round(current || 0)}
            {goal ? `/${goal}g` : 'g'}
          </Text>
        </View>
        <View style={{ height: 4, backgroundColor: colors.border,
          borderRadius: 2, overflow: 'hidden' }}>
          <View style={{ height: 4, width: `${pct * 100}%`,
            backgroundColor: color, borderRadius: 2 }} />
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: colors.bg,
      alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );

  const calsLeft = (goals?.calories || 2000) - (totals?.calories || 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Header */}
        <View style={{ flexDirection: 'row',
          justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20 }}>
          <Text style={{ color: colors.white, fontSize: 28,
            fontWeight: '900' }}>Nutrition</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: colors.muted,
              fontSize: font.sm }}>{date}</Text>
            <TouchableOpacity onPress={() => router.push('/nutrition/goals')}
              style={{ backgroundColor: colors.surface, borderRadius: 10,
                padding: 10, borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name="settings-outline" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calorie ring summary */}
        <View style={{ backgroundColor: colors.surface,
          borderRadius: radius.card, padding: 20,
          borderWidth: 1, borderColor: colors.border,
          marginBottom: 16 }}>
          <View style={{ flexDirection: 'row',
            justifyContent: 'space-around', marginBottom: 16 }}>
            {[
              { label: 'Goal', value: Math.round(goals?.calories || 2000), color: colors.muted },
              { label: 'Eaten', value: Math.round(totals?.calories || 0), color: colors.accent },
              { label: 'Remaining', value: Math.round(calsLeft), color: calsLeft >= 0 ? '#44AA44' : '#FF4444' },
            ].map((stat) => (
              <View key={stat.label} style={{ alignItems: 'center' }}>
                <Text style={{ color: stat.color, fontSize: 24,
                  fontWeight: '900' }}>{stat.value}</Text>
                <Text style={{ color: colors.muted, fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5 }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Macro bars */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <MacroBar label="Protein" current={totals?.protein}
              goal={goals?.protein} color="#FF6B6B" />
            <MacroBar label="Carbs" current={totals?.carbs}
              goal={goals?.carbs} color="#4ECDC4" />
            <MacroBar label="Fat" current={totals?.fat}
              goal={goals?.fat} color="#F7B731" />
          </View>

          {/* Extra macros row */}
          <View style={{ flexDirection: 'row', gap: 12,
            marginTop: 12 }}>
            {[
              { label: 'Fiber', value: totals?.fiber, goal: goals?.fiber, unit: 'g' },
              { label: 'Sugar', value: totals?.sugar, goal: goals?.sugar, unit: 'g' },
              { label: 'Sodium', value: totals?.sodium, goal: goals?.sodium, unit: 'mg' },
            ].map((m) => (
              <View key={m.label} style={{ flex: 1,
                backgroundColor: colors.dark, borderRadius: 8,
                padding: 8, alignItems: 'center' }}>
                <Text style={{ color: colors.white, fontSize: font.md,
                  fontWeight: '700' }}>
                  {Math.round(m.value || 0)}{m.unit}
                </Text>
                <Text style={{ color: colors.muted,
                  fontSize: 9, textTransform: 'uppercase',
                  letterSpacing: 0.5 }}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Water tracker */}
        <View style={{ backgroundColor: colors.surface,
          borderRadius: radius.card, padding: 16,
          borderWidth: 1, borderColor: colors.border,
          marginBottom: 16 }}>
          <View style={{ flexDirection: 'row',
            justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 12 }}>
            <Text style={{ color: colors.white, fontSize: font.md,
              fontWeight: '800' }}>💧 Water</Text>
            <Text style={{ color: colors.accent, fontSize: font.lg,
              fontWeight: '900' }}>
              {(water / 1000).toFixed(1)}L
              <Text style={{ color: colors.muted,
                fontSize: font.sm }}>
                /{((goals?.water_ml || 2500) / 1000).toFixed(1)}L
              </Text>
            </Text>
          </View>
          <View style={{ height: 6, backgroundColor: colors.border,
            borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
            <View style={{
              height: 6,
              width: `${Math.min(water / (goals?.water_ml || 2500), 1) * 100}%`,
              backgroundColor: '#4ECDC4', borderRadius: 3,
            }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {WATER_PRESETS.map((ml) => (
              <TouchableOpacity key={ml} onPress={() => handleAddWater(ml)}
                style={{ flex: 1, backgroundColor: colors.dark,
                  borderRadius: 8, padding: 8,
                  alignItems: 'center',
                  borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.white, fontSize: 11,
                  fontWeight: '700' }}>+{ml}ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Meal sections */}
        {MEALS.map((meal) => {
          const mealLogs = logs.filter((l) => l.meal_type === meal);
          const mealCals = mealLogs.reduce(
            (sum, l) => sum + (l.calories || 0), 0
          );
          return (
            <View key={meal} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: colors.white, fontSize: font.md,
                  fontWeight: '800' }}>{meal}</Text>
                <View style={{ flexDirection: 'row',
                  alignItems: 'center', gap: 10 }}>
                  <Text style={{ color: colors.muted,
                    fontSize: font.sm }}>
                    {Math.round(mealCals)} kcal
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveMeal(meal);
                      setShowFoodSearch(true);
                    }}
                    style={{ backgroundColor: colors.accent,
                      borderRadius: 6, width: 26, height: 26,
                      alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="add" size={18} color="#0D0D0D" />
                  </TouchableOpacity>
                </View>
              </View>

              {mealLogs.length === 0 ? (
                <View style={{ backgroundColor: colors.surface,
                  borderRadius: radius.card, padding: 12,
                  borderWidth: 1, borderColor: colors.border,
                  borderStyle: 'dashed' }}>
                  <Text style={{ color: colors.dim, fontSize: font.sm,
                    textAlign: 'center' }}>No foods logged</Text>
                </View>
              ) : (
                mealLogs.map((log) => (
                  <View key={log.id} style={{
                    backgroundColor: colors.surface,
                    borderRadius: radius.card, padding: 12,
                    borderWidth: 1, borderColor: colors.border,
                    marginBottom: 6,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.white,
                        fontSize: font.md, fontWeight: '700' }}>
                        {log.food_name}
                      </Text>
                      <Text style={{ color: colors.muted,
                        fontSize: 11, marginTop: 2 }}>
                        {log.servings} serving ·
                        P:{Math.round(log.protein)}g ·
                        C:{Math.round(log.carbs)}g ·
                        F:{Math.round(log.fat)}g
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Text style={{ color: colors.accent,
                        fontSize: font.md, fontWeight: '800' }}>
                        {Math.round(log.calories)} kcal
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteLog(log.id)}>
                        <Ionicons name="trash-outline"
                          size={16} color={colors.dim} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Food search modal - import from component */}
      <FoodSearchModal
        visible={showFoodSearch}
        mealType={activeMeal}
        date={date}
        onClose={() => setShowFoodSearch(false)}
        onLogged={() => { setShowFoodSearch(false); reload(); }}
      />
    </SafeAreaView>
  );
}
