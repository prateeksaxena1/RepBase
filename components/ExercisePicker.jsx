import { View, Text, TextInput, TouchableOpacity,
  FlatList, Modal } from 'react-native';
import { useState, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../constants/theme';

const CATEGORIES = ['All', 'Push', 'Pull', 'Legs', 'Full Body'];
const MUSCLES = ['All', 'Chest', 'Shoulders', 'Triceps', 'Back',
  'Biceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Cardio'];
const EQUIPMENT = ['All', 'Barbell', 'Dumbbell', 'Cable',
  'Machine', 'Bodyweight'];

const ExercisePicker = ({ visible, exercises, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeMuscle, setActiveMuscle] = useState('All');
  const [activeEquipment, setActiveEquipment] = useState('All');
  const [filterTab, setFilterTab] = useState('muscle');

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchQuery = ex.name.toLowerCase().includes(query.toLowerCase());
      const matchCat = activeCategory === 'All' || ex.category === activeCategory;
      const matchMuscle = activeMuscle === 'All' || ex.muscle_group === activeMuscle;
      const matchEquip = activeEquipment === 'All' || ex.equipment === activeEquipment;
      return matchQuery && matchCat && matchMuscle && matchEquip;
    });
  }, [query, activeCategory, activeMuscle, activeEquipment, exercises]);

  const ChipRow = ({ items, active, onPress }) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => onPress(item)}
          style={{
            paddingHorizontal: 12, paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: active === item ? colors.accent : colors.dark,
            borderWidth: 1,
            borderColor: active === item ? colors.accent : colors.border,
          }}>
          <Text style={{
            color: active === item ? '#0D0D0D' : colors.muted,
            fontSize: 11, fontWeight: '700',
          }}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        onSelect(item);
        setQuery('');
        setActiveCategory('All');
        setActiveMuscle('All');
        setActiveEquipment('All');
      }}
      style={{
        paddingVertical: 14, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: colors.border,
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.white, fontSize: font.md,
          fontWeight: '700' }}>{item.name}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
          <View style={{ backgroundColor: '#222', borderRadius: 4,
            paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ color: colors.muted, fontSize: 9 }}>
              {item.muscle_group}
            </Text>
          </View>
          <View style={{ backgroundColor: '#222', borderRadius: 4,
            paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ color: colors.muted, fontSize: 9 }}>
              {item.equipment}
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View style={{ backgroundColor: colors.surface,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          height: '90%' }}>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center',
            padding: 20, paddingBottom: 12,
            borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ flex: 1, color: colors.white,
              fontSize: 18, fontWeight: '900' }}>Add Exercise</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: 16, flex: 1 }}>
            {/* Search bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center',
              backgroundColor: colors.dark, borderRadius: radius.input,
              borderWidth: 1, borderColor: colors.border,
              paddingHorizontal: 12, marginBottom: 14 }}>
              <Ionicons name="search-outline" size={16} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search exercises..."
                placeholderTextColor={colors.dim}
                style={{ flex: 1, color: colors.white,
                  fontSize: font.md, padding: 10 }}
                autoCorrect={false}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={16} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter tabs */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {['muscle', 'equipment', 'category'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setFilterTab(tab)}
                  style={{
                    flex: 1, paddingVertical: 8,
                    borderRadius: 8, alignItems: 'center',
                    backgroundColor: filterTab === tab
                      ? colors.accent : colors.dark,
                    borderWidth: 1,
                    borderColor: filterTab === tab
                      ? colors.accent : colors.border,
                  }}>
                  <Text style={{
                    color: filterTab === tab ? '#0D0D0D' : colors.muted,
                    fontSize: 10, fontWeight: '800',
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filter chips */}
            {filterTab === 'muscle' && (
              <ChipRow items={MUSCLES} active={activeMuscle}
                onPress={setActiveMuscle} />
            )}
            {filterTab === 'equipment' && (
              <ChipRow items={EQUIPMENT} active={activeEquipment}
                onPress={setActiveEquipment} />
            )}
            {filterTab === 'category' && (
              <ChipRow items={CATEGORIES} active={activeCategory}
                onPress={setActiveCategory} />
            )}

            {/* Result count */}
            <Text style={{ color: colors.muted, fontSize: 11,
              marginBottom: 8 }}>
              {filtered.length} exercise{filtered.length !== 1 ? 's' : ''}
            </Text>

            {/* Exercise list */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={() => (
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <Ionicons name="barbell-outline"
                    size={40} color={colors.dim} />
                  <Text style={{ color: colors.muted, fontSize: font.md,
                    marginTop: 12 }}>No exercises found</Text>
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExercisePicker;
