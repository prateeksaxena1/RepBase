import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { LineChart } from 'react-native-gifted-charts';
import { getAllExercises } from '../../db/exercises';
import { getProgressForExercise, getPersonalBest } from '../../db/sessions';
import EmptyState from '../../components/EmptyState';
import { colors, font, radius } from '../../constants/theme';
import { TouchableOpacity } from 'react-native';

export default function Progress() {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState([]);
  const [pb, setPb] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useFocusEffect(useCallback(() => {
    const exs = getAllExercises();
    setExercises(exs);
    if (!selected && exs.length > 0) selectExercise(exs[0]);
  }, []));

  const selectExercise = (ex) => {
    setSelected(ex);
    setShowPicker(false);
    const data = getProgressForExercise(ex.id);
    setProgress(data);
    const best = getPersonalBest(ex.id);
    setPb(best?.pb || null);
  };

  const chartData = progress.map((p) => ({
    value: p.max_weight, label: p.date.slice(5),
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: colors.white, fontSize: 28,
          fontWeight: '900', marginBottom: 20 }}>Progress</Text>

        <TouchableOpacity onPress={() => setShowPicker(!showPicker)}
          style={{ backgroundColor: colors.surface, borderRadius: radius.card,
            padding: 14, borderWidth: 1, borderColor: colors.border,
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: colors.white, fontSize: font.md,
            fontWeight: '700' }}>{selected?.name || 'Select exercise'}</Text>
          <Text style={{ color: colors.muted, fontSize: font.sm }}>▼</Text>
        </TouchableOpacity>

        {showPicker && (
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.card,
            borderWidth: 1, borderColor: colors.border, marginBottom: 16 }}>
            {exercises.map((ex) => (
              <TouchableOpacity key={ex.id} onPress={() => selectExercise(ex)}
                style={{ padding: 14, borderBottomWidth: 1,
                  borderBottomColor: colors.border }}>
                <Text style={{ color: colors.white,
                  fontSize: font.md }}>{ex.name}</Text>
                <Text style={{ color: colors.muted,
                  fontSize: font.sm }}>{ex.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {progress.length < 2 ? (
          <EmptyState
            icon="bar-chart-outline"
            title="Not enough data"
            subtitle="Log at least 2 sessions with this exercise to see progress"
          />
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Personal Best', value: pb ? `${pb} kg` : '--' },
                { label: 'Sessions', value: progress.length },
                { label: 'Total Sets', value: progress.reduce((a, b) => a + b.total_sets, 0) },
              ].map((stat) => (
                <View key={stat.label} style={{ flex: 1, backgroundColor: colors.surface,
                  borderRadius: radius.card, padding: 12,
                  borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
                  <Text style={{ color: colors.muted, fontSize: 10,
                    textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Text>
                  <Text style={{ color: colors.accent, fontSize: 20,
                    fontWeight: '900', marginTop: 4 }}>{stat.value}</Text>
                </View>
              ))}
            </View>
            <LineChart
              data={chartData}
              color={colors.accent}
              thickness={2}
              dataPointsColor={colors.accent}
              backgroundColor={colors.surface}
              xAxisColor={colors.border}
              yAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.muted, fontSize: 9 }}
              hideRules
              curved
              width={280}
              height={180}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
