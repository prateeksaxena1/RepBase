import { View, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import { getRoutineById, getDaysForRoutine, getExercisesForDay,
  addDay, deleteDay, addExerciseToDay, removeExerciseFromDay,
  setActiveRoutine, updateRoutine } from '../../db/routines';
import { getAllExercises } from '../../db/exercises';
import { colors, font, radius } from '../../constants/theme';

export default function RoutineDetail() {
  const { id } = useLocalSearchParams();
  const [routine, setRoutine] = useState(null);
  const [days, setDays] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);
  const [dayExercises, setDayExercises] = useState({});
  const [showExPicker, setShowExPicker] = useState(false);
  const [pickerDayId, setPickerDayId] = useState(null);
  const [allExercises, setAllExercises] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const reload = () => {
    const r = getRoutineById(id);
    const d = getDaysForRoutine(id);
    setRoutine(r);
    setDays(d);
    const exMap = {};
    d.forEach((day) => { exMap[day.id] = getExercisesForDay(day.id); });
    setDayExercises(exMap);
  };

  useFocusEffect(useCallback(() => {
    reload();
    setAllExercises(getAllExercises());
  }, []));

  const handleAddDay = () => {
    const dayId = Crypto.randomUUID();
    const label = `Day ${days.length + 1}`;
    addDay({ id: dayId, routineId: id, label, dayOrder: days.length });
    reload();
    setExpandedDay(dayId);
  };

  const handleAddExercise = (exerciseId) => {
    const currentExs = dayExercises[pickerDayId] || [];
    addExerciseToDay({
      id: Crypto.randomUUID(),
      dayId: pickerDayId,
      exerciseId,
      targetSets: 3,
      targetReps: '8-12',
      exerciseOrder: currentExs.length,
    });
    setShowExPicker(false);
    reload();
  };

  const handleSaveEdit = () => {
    updateRoutine({ id, name: editName, description: editDesc });
    setEditing(false);
    reload();
  };

  if (!routine) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center',
        padding: 20, paddingBottom: 10 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={{ color: colors.white, fontSize: 20,
          fontWeight: '900', flex: 1 }}>{routine.name}</Text>
        <TouchableOpacity onPress={() => {
          setEditName(routine.name);
          setEditDesc(routine.description || '');
          setEditing(true);
        }}>
          <Ionicons name="pencil-outline" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 0 }}>
        {routine.is_active !== 1 && (
          <TouchableOpacity onPress={() => { setActiveRoutine(id); reload(); }}
            style={{ backgroundColor: colors.surface, borderRadius: radius.card,
              padding: 14, borderWidth: 1, borderColor: colors.border,
              alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: colors.accent, fontWeight: '800',
              fontSize: font.md }}>Set as Active Routine</Text>
          </TouchableOpacity>
        )}

        {days.map((day) => (
          <View key={day.id} style={{ marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
              style={{ backgroundColor: colors.surface, borderRadius: radius.card,
                padding: 14, borderWidth: 1, borderColor: colors.border,
                flexDirection: 'row', justifyContent: 'space-between',
                alignItems: 'center' }}>
              <Text style={{ color: colors.white, fontSize: font.md,
                fontWeight: '700' }}>{day.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ color: colors.muted, fontSize: font.sm }}>
                  {(dayExercises[day.id] || []).length} exercises
                </Text>
                <Ionicons
                  name={expandedDay === day.id ? 'chevron-up' : 'chevron-down'}
                  size={16} color={colors.muted} />
              </View>
            </TouchableOpacity>

            {expandedDay === day.id && (
              <View style={{ backgroundColor: colors.dark, borderRadius: radius.card,
                padding: 12, marginTop: 4, borderWidth: 1, borderColor: colors.border }}>
                {(dayExercises[day.id] || []).map((ex) => (
                  <View key={ex.id} style={{ flexDirection: 'row',
                    justifyContent: 'space-between', alignItems: 'center',
                    paddingVertical: 8, borderBottomWidth: 1,
                    borderBottomColor: colors.border }}>
                    <View>
                      <Text style={{ color: colors.white,
                        fontSize: font.md, fontWeight: '700' }}>{ex.name}</Text>
                      <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                        {ex.target_sets} sets · {ex.target_reps} reps
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                      removeExerciseFromDay(ex.id); reload();
                    }}>
                      <Ionicons name="trash-outline" size={18} color={colors.dim} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity onPress={() => {
                  setPickerDayId(day.id); setShowExPicker(true);
                }} style={{ marginTop: 10, borderRadius: radius.input,
                  borderWidth: 1, borderColor: colors.accent,
                  padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: colors.accent, fontWeight: '700',
                    fontSize: font.sm }}>+ Add Exercise</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity onPress={handleAddDay}
          style={{ borderRadius: radius.card, borderWidth: 1,
            borderColor: colors.border, borderStyle: 'dashed',
            padding: 16, alignItems: 'center', marginTop: 4 }}>
          <Text style={{ color: colors.muted, fontWeight: '700',
            fontSize: font.md }}>+ Add Day</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showExPicker} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View style={{ backgroundColor: colors.surface,
            borderTopLeftRadius: 20, borderTopRightRadius: 20,
            padding: 20, maxHeight: '70%' }}>
            <Text style={{ color: colors.white, fontSize: 18,
              fontWeight: '800', marginBottom: 16 }}>Add Exercise</Text>
            <ScrollView>
              {allExercises.map((ex) => (
                <TouchableOpacity key={ex.id} onPress={() => handleAddExercise(ex.id)}
                  style={{ padding: 14, borderBottomWidth: 1,
                    borderBottomColor: colors.border }}>
                  <Text style={{ color: colors.white,
                    fontSize: font.md, fontWeight: '700' }}>{ex.name}</Text>
                  <Text style={{ color: colors.muted,
                    fontSize: font.sm }}>{ex.category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowExPicker(false)}
              style={{ alignItems: 'center', padding: 16 }}>
              <Text style={{ color: colors.muted }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={editing} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View style={{ backgroundColor: colors.surface,
            borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <Text style={{ color: colors.white, fontSize: 18,
              fontWeight: '800', marginBottom: 20 }}>Edit Routine</Text>
            <TextInput value={editName} onChangeText={setEditName}
              placeholder="Routine name" placeholderTextColor={colors.dim}
              style={{ backgroundColor: colors.dark, color: colors.white,
                borderRadius: radius.input, padding: 14, fontSize: font.md,
                borderWidth: 1, borderColor: colors.border, marginBottom: 12 }} />
            <TextInput value={editDesc} onChangeText={setEditDesc}
              placeholder="Description (optional)"
              placeholderTextColor={colors.dim}
              style={{ backgroundColor: colors.dark, color: colors.white,
                borderRadius: radius.input, padding: 14, fontSize: font.md,
                borderWidth: 1, borderColor: colors.border, marginBottom: 20 }} />
            <TouchableOpacity onPress={handleSaveEdit}
              style={{ backgroundColor: colors.accent,
                borderRadius: radius.button, padding: 16,
                alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#0D0D0D', fontWeight: '900',
                fontSize: font.md, textTransform: 'uppercase' }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditing(false)}
              style={{ alignItems: 'center', padding: 8 }}>
              <Text style={{ color: colors.muted }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
