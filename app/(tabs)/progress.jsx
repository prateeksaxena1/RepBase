import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import * as Animatable from 'react-native-animatable';
import { getAllExercises } from '../../db/exercises';
import { getProgressForExercise, getPersonalBest, getVolumeOverTime, getMuscleSplit, getWorkoutFrequency } from '../../db/sessions';
import EmptyState from '../../components/EmptyState';
import { colors, font, radius } from '../../constants/theme';
import LoadingScreen from '../../components/LoadingScreen';
import OneRMCalculator from '../../components/OneRMCalculator';

export default function Progress() {
  const [activeTab, setActiveTab] = useState('Exercise');
  
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState([]);
  const [pb, setPb] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  const [volumeData, setVolumeData] = useState([]);
  const [muscleData, setMuscleData] = useState([]);
  const [freqData, setFreqData] = useState([]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    const exs = getAllExercises();
    setExercises(exs);
    if (!selected && exs.length > 0) {
      setSelected(exs[0]);
      setProgress(getProgressForExercise(exs[0].id));
      setPb(getPersonalBest(exs[0].id)?.pb || null);
    }
    
    setVolumeData(getVolumeOverTime());
    setMuscleData(getMuscleSplit());
    setFreqData(getWorkoutFrequency());
    
    setLoading(false);
  }, [selected]));

  const selectExercise = (ex) => {
    setSelected(ex);
    setShowPicker(false);
    setProgress(getProgressForExercise(ex.id));
    setPb(getPersonalBest(ex.id)?.pb || null);
  };

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
      {['Exercise', 'Volume', 'Muscle Split', 'Frequency'].map((tab) => (
        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
          style={{ marginRight: 20, borderBottomWidth: 2, paddingBottom: 8,
            borderBottomColor: activeTab === tab ? colors.accent : 'transparent' }}>
          <Text style={{ color: activeTab === tab ? colors.accent : colors.muted,
            fontSize: font.md, fontWeight: '800' }}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderExercise = () => (
    <>
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
          <View style={{ alignItems: 'center' }}>
            <LineChart
              data={progress.map((p) => ({ value: p.max_weight, label: p.date.slice(5) }))}
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
          </View>
        </>
      )}
    </>
  );

  const renderVolume = () => {
    if (volumeData.length === 0) return <EmptyState title="No Volume Data" subtitle="Log workouts to see volume over time" icon="bar-chart" />;
    
    return (
      <View style={{ alignItems: 'center' }}>
        <BarChart
          data={volumeData.map((d) => ({ value: d.total_volume, label: d.date.slice(5) }))}
          frontColor={colors.accent}
          backgroundColor={colors.bg}
          xAxisColor={colors.border}
          yAxisColor={colors.border}
          yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.muted, fontSize: 9 }}
          hideRules
          width={280}
          height={200}
        />
      </View>
    );
  };

  const renderMuscleSplit = () => {
    if (muscleData.length === 0) return <EmptyState title="No Muscle Data" icon="body" />;
    const totalSetsAll = muscleData.reduce((acc, curr) => acc + curr.total_sets, 0);
    const colorsMap = {
      Chest: '#FF6B6B', Back: '#4ECDC4', Shoulders: '#45B7D1',
      Biceps: '#96CEB4', Triceps: '#FFEAA7', Quads: '#DDA0DD',
      Hamstrings: '#98D8C8', Glutes: '#F7B731', Core: '#FD9644',
      Calves: '#A29BFE', Cardio: '#74B9FF'
    };

    return (
      <View>
        {muscleData.map(d => {
          const pct = Math.round((d.total_sets / totalSetsAll) * 100);
          return (
            <View key={d.muscle_group} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: colors.white, fontWeight: '700' }}>{d.muscle_group || 'Other'}</Text>
                <Text style={{ color: colors.muted }}>{pct}% ({d.total_sets} sets)</Text>
              </View>
              <View style={{ height: 10, backgroundColor: colors.surface, borderRadius: 5, overflow: 'hidden' }}>
                <View style={{ width: `${pct}%`, height: '100%', backgroundColor: colorsMap[d.muscle_group] || colors.accent }} />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderFrequency = () => {
    if (freqData.length === 0) return <EmptyState title="No Frequency Data" icon="calendar" />;
    
    const today = new Date();
    const days = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    
    const workoutDays = new Set(freqData.map(f => f.date));
    
    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: colors.muted, marginBottom: 12 }}>Last 12 Weeks</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 280, gap: 4 }}>
          {days.map(d => (
            <View key={d} style={{
              width: 16, height: 16, borderRadius: 3,
              backgroundColor: workoutDays.has(d) ? colors.accent : colors.surface,
              borderWidth: workoutDays.has(d) ? 0 : 1,
              borderColor: colors.border
            }} />
          ))}
        </View>
      </View>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          <Text style={{ color: colors.accent, fontSize: 11,
            fontWeight: '800' }}>1RM CALC</Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
        {renderTabs()}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 0 }}>
        {activeTab === 'Exercise' && renderExercise()}
        {activeTab === 'Volume' && renderVolume()}
        {activeTab === 'Muscle Split' && renderMuscleSplit()}
        {activeTab === 'Frequency' && renderFrequency()}
      </ScrollView>

      <OneRMCalculator
        visible={showCalc}
        onClose={() => setShowCalc(false)}
      />
    </SafeAreaView>
  );
}
