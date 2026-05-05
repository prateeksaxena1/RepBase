import { View, Text, ScrollView, TextInput,
  TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getNutritionGoals, saveNutritionGoals } from '../../db/nutrition';
import { colors, font, radius } from '../../constants/theme';

const GOAL_FIELDS = [
  { key: 'calories', label: 'Daily Calories', unit: 'kcal',
    default: 2000, color: colors.accent },
  { key: 'protein', label: 'Protein', unit: 'g',
    default: 150, color: '#FF6B6B' },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g',
    default: 250, color: '#4ECDC4' },
  { key: 'fat', label: 'Fat', unit: 'g',
    default: 65, color: '#F7B731' },
  { key: 'fiber', label: 'Fiber', unit: 'g',
    default: 30, color: '#96CEB4' },
  { key: 'sugar', label: 'Sugar', unit: 'g',
    default: 50, color: '#DDA0DD' },
  { key: 'sodium', label: 'Sodium', unit: 'mg',
    default: 2300, color: '#A29BFE' },
  { key: 'water_ml', label: 'Water', unit: 'ml',
    default: 2500, color: '#4ECDC4' },
];

export default function NutritionGoals() {
  const [values, setValues] = useState({});

  useEffect(() => {
    const goals = getNutritionGoals();
    if (goals) {
      setValues(goals);
    } else {
      const defaults = {};
      GOAL_FIELDS.forEach((f) => { defaults[f.key] = f.default; });
      setValues(defaults);
    }
  }, []);

  const handleSave = () => {
    saveNutritionGoals(values);
    Alert.alert('Saved!', 'Nutrition goals updated.');
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center',
        padding: 20, paddingBottom: 10 }}>
        <TouchableOpacity onPress={() => router.back()}
          style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={{ color: colors.white, fontSize: 20,
          fontWeight: '900', flex: 1 }}>Nutrition Goals</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {GOAL_FIELDS.map((field) => (
          <View key={field.key} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row',
              justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: colors.white, fontSize: font.md,
                fontWeight: '700' }}>{field.label}</Text>
              <Text style={{ color: field.color,
                fontSize: font.sm }}>{field.unit}</Text>
            </View>
            <TextInput
              value={String(values[field.key] || field.default)}
              onChangeText={(v) =>
                setValues((prev) => ({ ...prev, [field.key]: parseFloat(v) || 0 }))}
              keyboardType="numeric"
              style={{ backgroundColor: colors.surface,
                color: colors.white, borderRadius: radius.input,
                padding: 14, fontSize: font.lg, fontWeight: '700',
                borderWidth: 1, borderColor: colors.border }}
            />
          </View>
        ))}

        <TouchableOpacity onPress={handleSave}
          style={{ backgroundColor: colors.accent,
            borderRadius: radius.button, padding: 16,
            alignItems: 'center', marginTop: 8 }}>
          <Text style={{ color: '#0D0D0D', fontWeight: '900',
            fontSize: font.md, textTransform: 'uppercase',
            letterSpacing: 0.8 }}>Save Goals</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
