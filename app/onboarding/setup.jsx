import { View, Text, TouchableOpacity,
  TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../../constants/theme';
import { saveNutritionGoals } from '../../db/nutrition';
import * as Crypto from 'expo-crypto';

const GOALS = [
  { id: 'lose_fat', label: 'Lose Fat', icon: 'flame-outline' },
  { id: 'build_muscle', label: 'Build Muscle', icon: 'barbell-outline' },
  { id: 'get_stronger', label: 'Get Stronger', icon: 'trending-up-outline' },
  { id: 'stay_active', label: 'Stay Active', icon: 'walk-outline' },
  { id: 'athletic', label: 'Athletic Performance', icon: 'trophy-outline' },
];

const EXPERIENCE = [
  { id: 'beginner', label: 'Beginner', sub: 'Less than 1 year' },
  { id: 'intermediate', label: 'Intermediate', sub: '1–3 years' },
  { id: 'advanced', label: 'Advanced', sub: '3+ years' },
];

export default function Setup() {
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [experience, setExperience] = useState('');
  const [calories, setCalories] = useState('2000');
  const [protein, setProtein] = useState('150');

  const toggleGoal = (id) => {
    setSelectedGoals((prev) =>
      prev.includes(id)
        ? prev.filter((g) => g !== id)
        : [...prev, id]
    );
  };

  const handleFinish = () => {
    saveNutritionGoals({
      calories: parseFloat(calories) || 2000,
      protein: parseFloat(protein) || 150,
      carbs: 250, fat: 65, fiber: 30,
      sugar: 50, sodium: 2300, water_ml: 2500,
    });
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 28 }}>

        {/* Progress bar */}
        <View style={{ height: 4, backgroundColor: colors.border,
          borderRadius: 2, marginBottom: 32, overflow: 'hidden' }}>
          <View style={{ height: 4, borderRadius: 2,
            backgroundColor: colors.accent,
            width: `${(step / 3) * 100}%` }} />
        </View>

        {step === 1 && (
          <Animatable.View animation="fadeInRight">
            <Text style={{ color: colors.white, fontSize: 26,
              fontWeight: '900', marginBottom: 8 }}>
              What are your goals?
            </Text>
            <Text style={{ color: colors.muted, fontSize: font.md,
              marginBottom: 28 }}>Select all that apply</Text>
            {GOALS.map((goal) => {
              const selected = selectedGoals.includes(goal.id);
              return (
                <TouchableOpacity key={goal.id}
                  onPress={() => toggleGoal(goal.id)}
                  style={{ backgroundColor: selected
                    ? colors.accent + '20' : colors.surface,
                    borderRadius: radius.card, padding: 16,
                    marginBottom: 10, borderWidth: 1.5,
                    borderColor: selected
                      ? colors.accent : colors.border,
                    flexDirection: 'row', alignItems: 'center',
                    gap: 14 }}>
                  <Ionicons name={goal.icon} size={24}
                    color={selected ? colors.accent : colors.muted} />
                  <Text style={{
                    color: selected ? colors.accent : colors.white,
                    fontSize: font.lg, fontWeight: '800' }}>
                    {goal.label}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark-circle"
                      size={20} color={colors.accent}
                      style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => selectedGoals.length > 0
                ? setStep(2)
                : Alert.alert('Pick at least one goal')}
              style={{ backgroundColor: colors.accent,
                borderRadius: radius.button, padding: 16,
                alignItems: 'center', marginTop: 20 }}>
              <Text style={{ color: '#0D0D0D', fontWeight: '900',
                fontSize: font.md, textTransform: 'uppercase' }}>
                Continue
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        )}

        {step === 2 && (
          <Animatable.View animation="fadeInRight">
            <Text style={{ color: colors.white, fontSize: 26,
              fontWeight: '900', marginBottom: 8 }}>
              Experience level?
            </Text>
            <Text style={{ color: colors.muted, fontSize: font.md,
              marginBottom: 28 }}>Be honest — it helps us set defaults</Text>
            {EXPERIENCE.map((e) => {
              const selected = experience === e.id;
              return (
                <TouchableOpacity key={e.id}
                  onPress={() => setExperience(e.id)}
                  style={{ backgroundColor: selected
                    ? colors.accent + '20' : colors.surface,
                    borderRadius: radius.card, padding: 18,
                    marginBottom: 10, borderWidth: 1.5,
                    borderColor: selected
                      ? colors.accent : colors.border }}>
                  <Text style={{
                    color: selected ? colors.accent : colors.white,
                    fontSize: font.lg, fontWeight: '800' }}>
                    {e.label}
                  </Text>
                  <Text style={{ color: colors.muted,
                    fontSize: font.sm, marginTop: 2 }}>
                    {e.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => experience
                ? setStep(3)
                : Alert.alert('Select your experience level')}
              style={{ backgroundColor: colors.accent,
                borderRadius: radius.button, padding: 16,
                alignItems: 'center', marginTop: 20 }}>
              <Text style={{ color: '#0D0D0D', fontWeight: '900',
                fontSize: font.md, textTransform: 'uppercase' }}>
                Continue
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        )}

        {step === 3 && (
          <Animatable.View animation="fadeInRight">
            <Text style={{ color: colors.white, fontSize: 26,
              fontWeight: '900', marginBottom: 8 }}>
              Set your daily targets
            </Text>
            <Text style={{ color: colors.muted, fontSize: font.md,
              marginBottom: 28 }}>
              You can change these anytime in settings
            </Text>
            {[
              { label: 'Daily Calories', value: calories,
                onChange: setCalories, unit: 'kcal',
                color: colors.accent },
              { label: 'Daily Protein', value: protein,
                onChange: setProtein, unit: 'g',
                color: '#FF6B6B' },
            ].map((field) => (
              <View key={field.label} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 8 }}>
                  <Text style={{ color: colors.white,
                    fontSize: font.md, fontWeight: '700' }}>
                    {field.label}
                  </Text>
                  <Text style={{ color: field.color,
                    fontSize: font.sm }}>{field.unit}</Text>
                </View>
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="numeric"
                  style={{ backgroundColor: colors.surface,
                    color: colors.white,
                    borderRadius: radius.input,
                    padding: 14, fontSize: font.xl,
                    fontWeight: '900',
                    borderWidth: 1, borderColor: colors.border,
                    textAlign: 'center' }}
                />
              </View>
            ))}

            <TouchableOpacity onPress={handleFinish}
              style={{ backgroundColor: colors.accent,
                borderRadius: radius.button, padding: 18,
                alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: '#0D0D0D', fontWeight: '900',
                fontSize: font.lg, textTransform: 'uppercase',
                letterSpacing: 1 }}>
                Start Training 🔥
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
