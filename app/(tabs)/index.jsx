import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import * as Animatable from 'react-native-animatable';
import useRoutineStore from '../../store/useRoutineStore';
import ExerciseCard from '../../components/ExerciseCard';
import EmptyState from '../../components/EmptyState';
import { getDaysForRoutine, getExercisesForDay } from '../../db/routines';
import { getWorkoutStreak } from '../../db/sessions';
import { colors, font, radius } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';

export default function Dashboard() {
  const { activeRoutine, loadRoutines } = useRoutineStore();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadRoutines();
    setStreak(getWorkoutStreak());
    setLoading(false);
  }, []));

  const days = activeRoutine ? getDaysForRoutine(activeRoutine.id) : [];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dayIndex = (new Date().getDay() + 6) % 7;
  const todayDay = days[dayIndex % days.length] || days[0];
  const exercises = todayDay ? getExercisesForDay(todayDay.id) : [];

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animatable.View animation="fadeInUp" duration={400} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          <View style={{ flexDirection: 'row',
            justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ color: colors.muted, fontSize: font.sm,
                letterSpacing: 1, textTransform: 'uppercase' }}>{today}</Text>
              <Text style={{ color: colors.white, fontSize: 26,
                fontWeight: '900', marginTop: 2, lineHeight: 30 }}>
                {"Today's\nWorkout"}
              </Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#1A1A1A',
            borderRadius: 12, padding: 14, marginBottom: 16,
            borderWidth: 1, borderColor: '#2A2A2A',
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between', marginTop: 16 }}>
            <View>
              <Text style={{ color: '#888', fontSize: 10,
                textTransform: 'uppercase', letterSpacing: 1 }}>
                Current Streak
              </Text>
              <Text style={{ color: '#fff', fontSize: 22,
                fontWeight: '900', marginTop: 2 }}>
                {streak} days 🔥
              </Text>
            </View>
            <Text style={{ fontSize: 36 }}>
              {streak >= 7 ? '🏆' : streak >= 3 ? '⚡' : '💪'}
            </Text>
          </View>

          {!activeRoutine ? (
          <EmptyState
            icon="barbell-outline"
            title="No active routine"
            subtitle="Set a routine as active to start logging workouts"
            buttonLabel="Go to Routines"
            onButtonPress={() => router.push('/(tabs)/routines')}
          />
        ) : (
          <>
            <View style={{ marginTop: 16, backgroundColor: colors.surface,
              borderRadius: radius.card, padding: 12,
              borderWidth: 1, borderColor: colors.border,
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'center' }}>
              <View>
                <Text style={{ color: colors.muted, fontSize: 9,
                  textTransform: 'uppercase', letterSpacing: 1 }}>Active Routine</Text>
                <Text style={{ color: colors.white, fontSize: font.md,
                  fontWeight: '800', marginTop: 2 }}>{activeRoutine.name}</Text>
              </View>
              <View style={{ backgroundColor: colors.accent,
                borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ color: '#0D0D0D', fontSize: 9,
                  fontWeight: '900' }}>{todayDay?.label || 'Day 1'}</Text>
              </View>
            </View>

            <Text style={{ color: colors.muted, fontSize: 10,
              textTransform: 'uppercase', letterSpacing: 1,
              marginTop: 20, marginBottom: 10 }}>
              Exercises · {exercises.length}
            </Text>

            {exercises.map((ex, i) => (
              <ExerciseCard key={ex.id} exercise={ex}
                isHighlighted={i === 0} />
            ))}

            <TouchableOpacity
              onPress={() => router.push(`/workout/${todayDay?.id}`)}
              style={{ marginTop: 16, backgroundColor: colors.accent,
                borderRadius: radius.button, padding: 16,
                alignItems: 'center' }}>
              <Text style={{ color: '#0D0D0D', fontWeight: '900',
                fontSize: font.md, textTransform: 'uppercase',
                letterSpacing: 1 }}>Start Workout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      </Animatable.View>
    </SafeAreaView>
  );
}
