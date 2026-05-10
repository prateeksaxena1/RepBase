import { View, Text, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import useRoutineStore from '../../store/useRoutineStore';
import RoutineCard from '../../components/RoutineCard';
import EmptyState from '../../components/EmptyState';
import LoadingScreen from '../../components/LoadingScreen';
import { createRoutine } from '../../db/routines';
import { colors, font, radius } from '../../constants/theme';

export default function Routines() {
  const { routines, loadRoutines, setActiveRoutine, removeRoutine } = useRoutineStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadRoutines();
    setLoading(false);
  }, []));

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed)
      return Alert.alert('Name Required', 'Please enter a routine name.');
    if (trimmed.length < 2)
      return Alert.alert('Too Short', 'Routine name must be at least 2 characters.');
    if (trimmed.length > 50)
      return Alert.alert('Too Long', 'Routine name must be under 50 characters.');

    const id = Crypto.randomUUID();
    createRoutine({ id, name: trimmed, description: description.trim() });
    setName(''); setDescription('');
    setModalVisible(false);
    loadRoutines();
    router.push(`/routine/${id}`);
  };

  const handleLongPress = (routine) => {
    Alert.alert(routine.name, 'Choose an action', [
      { text: 'Set as Active', onPress: () => setActiveRoutine(routine.id) },
      { text: 'Edit', onPress: () => router.push(`/routine/${routine.id}`) },
      { text: 'Delete', style: 'destructive', onPress: () =>
        Alert.alert('Delete?', 'This cannot be undone', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive',
            onPress: () => removeRoutine(routine.id) },
        ])
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animatable.View animation="fadeInUp" duration={400} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 20 }}>
          <View style={{ flexDirection: 'row',
          justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 20 }}>
          <View>
            <Text style={{ color: colors.white, fontSize: 28,
              fontWeight: '900' }}>Routines</Text>
            <Text style={{ color: colors.muted, fontSize: font.sm, marginTop: 2 }}>
              {routines.length} routines · unlimited
            </Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}
            style={{ width: 36, height: 36, backgroundColor: colors.accent,
              borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add" size={22} color="#0D0D0D" />
          </TouchableOpacity>
        </View>

        {routines.length === 0 ? (
          <EmptyState
            icon="list-outline"
            title="No routines yet"
            subtitle="Create your first routine to get started"
            buttonLabel="Create Routine"
            onButtonPress={() => setModalVisible(true)}
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {routines.map((r) => (
              <RoutineCard key={r.id} routine={r}
                onPress={() => router.push(`/routine/${r.id}`)}
                onLongPress={() => handleLongPress(r)} />
            ))}
          </ScrollView>
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View style={{ backgroundColor: colors.surface,
            borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 }}>
            <Text style={{ color: colors.white, fontSize: 18,
              fontWeight: '800', marginBottom: 20 }}>New Routine</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Routine name e.g. PPL Bulk Phase"
              placeholderTextColor={colors.dim}
              style={{ backgroundColor: colors.dark, color: colors.white,
                borderRadius: radius.input, padding: 14, fontSize: font.md,
                borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description (optional)"
              placeholderTextColor={colors.dim}
              style={{ backgroundColor: colors.dark, color: colors.white,
                borderRadius: radius.input, padding: 14, fontSize: font.md,
                borderWidth: 1, borderColor: colors.border, marginBottom: 20 }}
            />
            <TouchableOpacity onPress={handleCreate}
              style={{ backgroundColor: colors.accent,
                borderRadius: radius.button, padding: 16,
                alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#0D0D0D', fontWeight: '900',
                fontSize: font.md, textTransform: 'uppercase',
                letterSpacing: 0.8 }}>Create Routine</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setModalVisible(false); setName(''); setDescription('');
            }} style={{ alignItems: 'center', padding: 8 }}>
              <Text style={{ color: colors.muted, fontSize: font.md }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </Animatable.View>
    </SafeAreaView>
  );
}
