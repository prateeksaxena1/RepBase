import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import useRoutineStore from '../../store/useRoutineStore';
import useWorkoutStore from '../../store/useWorkoutStore';
import SetRow from '../../components/SetRow';
import { getExercisesForDay } from '../../db/routines';
import { colors, font, radius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import RestTimer from '../../components/RestTimer';
import * as Haptics from 'expo-haptics';
import PlateCalculator from '../../components/PlateCalculator';
import { updateSessionNotes } from '../../db/sessions';

export default function WorkoutSession() {
  const { id } = useLocalSearchParams();
  const { activeRoutine } = useRoutineStore();
  const { startWorkout, logSet, finishWorkout, isActive, sessionId } = useWorkoutStore();
  const [exercises, setExercises] = useState([]);
  const [sets, setSets] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [showPlates, setShowPlates] = useState(false);
  const [workoutNote, setWorkoutNote] = useState('');

  useFocusEffect(useCallback(() => {
    const exs = getExercisesForDay(id);
    setExercises(exs);
    const initial = {};
    exs.forEach((ex) => {
      initial[ex.exercise_id] = [{ reps: '', weight: '', completed: false }];
    });
    setSets(initial);
  }, []));

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStart = () => {
    startWorkout({
      routineId: activeRoutine?.id,
      exercises: exercises.map((e) => ({ exerciseId: e.exercise_id, name: e.name, sets: [] })),
    });
    setStarted(true);
  };

  const handleAddSet = (exerciseId) => {
    setSets((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []),
        { reps: '', weight: '', completed: false }],
    }));
  };

  const handleSetChange = (exerciseId, index, field, value) => {
    setSets((prev) => {
      const updated = [...(prev[exerciseId] || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [exerciseId]: updated };
    });
  };

  const handleCompleteSet = (exerciseId, index) => {
    const set = sets[exerciseId][index];
    const weight = parseFloat(set.weight);
    const reps = parseInt(set.reps);

    if (!set.weight && !set.reps)
      return Alert.alert('Missing Info', 'Enter weight and reps before completing a set.');
    if (!set.weight)
      return Alert.alert('Missing Weight', 'Enter the weight for this set.');
    if (!set.reps)
      return Alert.alert('Missing Reps', 'Enter the reps for this set.');
    if (isNaN(weight) || weight <= 0)
      return Alert.alert('Invalid Weight', 'Weight must be a number greater than 0.');
    if (isNaN(reps) || reps <= 0 || reps > 200)
      return Alert.alert('Invalid Reps', 'Reps must be between 1 and 200.');
    if (weight > 1000)
      return Alert.alert('Invalid Weight', 'Weight cannot exceed 1000kg.');
    if (set.completed)
      return Alert.alert('Already Logged', 'This set is already completed.');

    logSet({ exerciseId, setNumber: index + 1, weightKg: weight, reps });
    handleSetChange(exerciseId, index, 'completed', true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowRestTimer(true);
  };

  const handleFinish = () => {
    Alert.alert('Finish Workout?', 'Your session will be saved', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Finish', onPress: () => {
        updateSessionNotes(sessionId, workoutNote);
        finishWorkout();
        router.replace('/(tabs)/history');
      }},
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center',
        padding: 20, paddingBottom: 10 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={{ color: colors.white, fontSize: 20,
          fontWeight: '900', flex: 1 }}>Workout</Text>
        <TouchableOpacity onPress={() => setShowPlates(true)}
          style={{ backgroundColor: colors.surface, borderRadius: 8,
            paddingHorizontal: 10, paddingVertical: 6,
            borderWidth: 1, borderColor: colors.border,
            marginRight: 8 }}>
          <Text style={{ color: colors.accent, fontSize: 10,
            fontWeight: '800' }}>PLATES</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.accent, fontSize: 20,
          fontWeight: '900', fontVariant: ['tabular-nums'] }}>
          {formatTime(elapsed)}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}>
        {!started ? (
          <TouchableOpacity onPress={handleStart}
            style={{ backgroundColor: colors.accent, borderRadius: radius.button,
              padding: 16, alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: '#0D0D0D', fontWeight: '900',
              fontSize: font.md, textTransform: 'uppercase',
              letterSpacing: 1 }}>Begin Workout</Text>
          </TouchableOpacity>
        ) : null}

        {showRestTimer && (
          <RestTimer
            defaultDuration={restDuration}
            onSkip={() => setShowRestTimer(false)}
          />
        )}

        {exercises.map((ex) => (
          <View key={ex.exercise_id} style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.white, fontSize: font.lg,
              fontWeight: '800', marginBottom: 4 }}>{ex.name}</Text>
            <Text style={{ color: colors.muted, fontSize: font.sm,
              marginBottom: 10 }}>
              Target: {ex.target_sets} sets · {ex.target_reps} reps
            </Text>
            {(sets[ex.exercise_id] || []).map((set, i) => (
              <SetRow
                key={i}
                setNumber={i + 1}
                reps={set.reps}
                weight={set.weight}
                completed={set.completed}
                onRepsChange={(v) => handleSetChange(ex.exercise_id, i, 'reps', v)}
                onWeightChange={(v) => handleSetChange(ex.exercise_id, i, 'weight', v)}
                onComplete={() => handleCompleteSet(ex.exercise_id, i)}
              />
            ))}
            <TouchableOpacity onPress={() => handleAddSet(ex.exercise_id)}
              style={{ borderRadius: radius.input, borderWidth: 1,
                borderColor: colors.border, padding: 10, alignItems: 'center' }}>
              <Text style={{ color: colors.muted, fontSize: font.sm }}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        {started && (
          <>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.muted, fontSize: 11,
                textTransform: 'uppercase', letterSpacing: 1,
                marginBottom: 8 }}>Session Notes</Text>
              <TextInput
                value={workoutNote}
                onChangeText={setWorkoutNote}
                placeholder="How did this session feel? Any PRs?"
                placeholderTextColor={colors.dim}
                multiline
                numberOfLines={3}
                style={{ backgroundColor: colors.surface,
                  color: colors.white, borderRadius: radius.input,
                  padding: 14, fontSize: font.md,
                  borderWidth: 1, borderColor: colors.border,
                  textAlignVertical: 'top', minHeight: 80 }}
              />
            </View>
            <TouchableOpacity onPress={handleFinish}
              style={{ backgroundColor: colors.accent, borderRadius: radius.button,
                padding: 16, alignItems: 'center', marginTop: 10, marginBottom: 40 }}>
              <Text style={{ color: '#0D0D0D', fontWeight: '900',
                fontSize: font.md, textTransform: 'uppercase',
                letterSpacing: 1 }}>Finish Workout</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      <PlateCalculator
        visible={showPlates}
        onClose={() => setShowPlates(false)}
      />
    </SafeAreaView>
  );
}
