import { View, Text, TextInput, TouchableOpacity,
  FlatList, Modal, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../constants/theme';
import { searchFoodsLocal, searchFoodAPI,
  createFood, logFood } from '../db/nutrition';
import BarcodeScanner from './BarcodeScanner';

const FoodSearchModal = ({ visible, mealType, date, onClose, onLogged }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [servings, setServings] = useState('1');
  const [showScanner, setShowScanner] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const local = searchFoodsLocal(query);
    const api = await searchFoodAPI(query);
    const merged = [...local,
      ...api.filter((a) => !local.find((l) => l.barcode === a.barcode))];
    setResults(merged);
    setLoading(false);
  };

  const handleLog = () => {
    if (!selected) return;
    const s = parseFloat(servings) || 1;
    const ratio = s;
    logFood({
      id: Crypto.randomUUID(),
      foodId: selected.id,
      date, mealType,
      servings: s,
      calories: (selected.calories || 0) * ratio,
      protein: (selected.protein || 0) * ratio,
      carbs: (selected.carbs || 0) * ratio,
      fat: (selected.fat || 0) * ratio,
      fiber: (selected.fiber || 0) * ratio,
      sugar: (selected.sugar || 0) * ratio,
      sodium: (selected.sodium || 0) * ratio,
    });

    // Save to local foods if from API
    if (!selected.is_custom && selected.barcode) {
      try { createFood({ ...selected, is_custom: 0 }); } catch (e) {}
    }

    setSelected(null);
    setQuery('');
    setResults([]);
    setServings('1');
    onLogged();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View style={{ backgroundColor: colors.surface,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          height: '90%', padding: 20 }}>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center',
            marginBottom: 16 }}>
            <Text style={{ flex: 1, color: colors.white,
              fontSize: 18, fontWeight: '900' }}>
              Add to {mealType}
            </Text>
            <TouchableOpacity onPress={() => {
              setSelected(null); setResults([]);
              setQuery(''); onClose();
            }}>
              <Ionicons name="close" size={24} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {!selected ? (
            <>
              {/* Search bar */}
              <View style={{ flexDirection: 'row', gap: 8,
                marginBottom: 12 }}>
                <View style={{ flex: 1, flexDirection: 'row',
                  alignItems: 'center', backgroundColor: colors.dark,
                  borderRadius: radius.input, borderWidth: 1,
                  borderColor: colors.border, paddingHorizontal: 12 }}>
                  <Ionicons name="search-outline"
                    size={16} color={colors.muted} />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                    placeholder="Search food..."
                    placeholderTextColor={colors.dim}
                    returnKeyType="search"
                    style={{ flex: 1, color: colors.white,
                      fontSize: font.md, padding: 10 }}
                  />
                </View>
                {/* Barcode scanner button */}
                <TouchableOpacity
                  onPress={() => setShowScanner(true)}
                  style={{ backgroundColor: colors.dark,
                    borderRadius: radius.input, padding: 12,
                    borderWidth: 1, borderColor: colors.border,
                    alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="barcode-outline"
                    size={22} color={colors.accent} />
                </TouchableOpacity>
              </View>

              {/* Action buttons */}
              <View style={{ flexDirection: 'row', gap: 8,
                marginBottom: 16 }}>
                <TouchableOpacity onPress={handleSearch}
                  style={{ flex: 1, backgroundColor: colors.accent,
                    borderRadius: radius.input, padding: 12,
                    alignItems: 'center' }}>
                  <Text style={{ color: '#0D0D0D', fontWeight: '800',
                    fontSize: font.sm }}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowManual(true)}
                  style={{ flex: 1, backgroundColor: colors.dark,
                    borderRadius: radius.input, padding: 12,
                    alignItems: 'center', borderWidth: 1,
                    borderColor: colors.border }}>
                  <Text style={{ color: colors.white, fontWeight: '700',
                    fontSize: font.sm }}>+ Manual</Text>
                </TouchableOpacity>
              </View>

              {loading && (
                <ActivityIndicator color={colors.accent}
                  style={{ marginTop: 20 }} />
              )}

              <FlatList
                data={results}
                keyExtractor={(item, i) => item.id + i}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => !loading && query ? (
                  <Text style={{ color: colors.muted, textAlign: 'center',
                    marginTop: 30, fontSize: font.sm }}>
                    No results. Try a different search or add manually.
                  </Text>
                ) : null}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setSelected(item)}
                    style={{ paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.white,
                        fontSize: font.md,
                        fontWeight: '700' }}>{item.name}</Text>
                      {!!item.brand && (
                        <Text style={{ color: colors.muted,
                          fontSize: 11 }}>{item.brand}</Text>
                      )}
                      <Text style={{ color: colors.muted, fontSize: 11 }}>
                        P:{Math.round(item.protein || 0)}g ·
                        C:{Math.round(item.carbs || 0)}g ·
                        F:{Math.round(item.fat || 0)}g
                        per 100g
                      </Text>
                    </View>
                    <Text style={{ color: colors.accent,
                      fontSize: font.md, fontWeight: '800' }}>
                      {Math.round(item.calories || 0)} kcal
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : (
            // Food detail + serving selector
            <View>
              <TouchableOpacity onPress={() => setSelected(null)}
                style={{ flexDirection: 'row', alignItems: 'center',
                  marginBottom: 16, gap: 6 }}>
                <Ionicons name="arrow-back"
                  size={18} color={colors.muted} />
                <Text style={{ color: colors.muted,
                  fontSize: font.sm }}>Back to results</Text>
              </TouchableOpacity>

              <Text style={{ color: colors.white, fontSize: 20,
                fontWeight: '900', marginBottom: 4 }}>
                {selected.name}
              </Text>
              {!!selected.brand && (
                <Text style={{ color: colors.muted, fontSize: font.sm,
                  marginBottom: 16 }}>{selected.brand}</Text>
              )}

              {/* Nutrition per 100g */}
              <View style={{ backgroundColor: colors.dark,
                borderRadius: radius.card, padding: 14,
                marginBottom: 20, borderWidth: 1,
                borderColor: colors.border }}>
                <Text style={{ color: colors.muted, fontSize: 10,
                  textTransform: 'uppercase', letterSpacing: 1,
                  marginBottom: 10 }}>Per 100g</Text>
                <View style={{ flexDirection: 'row',
                  flexWrap: 'wrap', gap: 10 }}>
                  {[
                    { label: 'Calories', value: selected.calories, unit: 'kcal', color: colors.accent },
                    { label: 'Protein', value: selected.protein, unit: 'g', color: '#FF6B6B' },
                    { label: 'Carbs', value: selected.carbs, unit: 'g', color: '#4ECDC4' },
                    { label: 'Fat', value: selected.fat, unit: 'g', color: '#F7B731' },
                    { label: 'Fiber', value: selected.fiber, unit: 'g', color: '#96CEB4' },
                    { label: 'Sugar', value: selected.sugar, unit: 'g', color: '#DDA0DD' },
                    { label: 'Sodium', value: selected.sodium, unit: 'mg', color: '#A29BFE' },
                  ].map((n) => (
                    <View key={n.label} style={{ width: '30%',
                      alignItems: 'center' }}>
                      <Text style={{ color: n.color, fontSize: font.md,
                        fontWeight: '800' }}>
                        {Math.round(n.value || 0)}{n.unit}
                      </Text>
                      <Text style={{ color: colors.muted,
                        fontSize: 9, textTransform: 'uppercase',
                        letterSpacing: 0.3 }}>{n.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Servings input */}
              <Text style={{ color: colors.muted, fontSize: 11,
                textTransform: 'uppercase', letterSpacing: 0.5,
                marginBottom: 8 }}>Number of servings (100g each)</Text>
              <TextInput
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
                style={{ backgroundColor: colors.dark,
                  color: colors.white, borderRadius: radius.input,
                  padding: 14, fontSize: font.xl, fontWeight: '900',
                  borderWidth: 1, borderColor: colors.border,
                  textAlign: 'center', marginBottom: 20 }}
              />

              {/* Total for this log */}
              <View style={{ backgroundColor: colors.dark,
                borderRadius: radius.card, padding: 12,
                marginBottom: 20, borderWidth: 1,
                borderColor: colors.accent, flexDirection: 'row',
                justifyContent: 'space-around' }}>
                {['calories', 'protein', 'carbs', 'fat'].map((m) => (
                  <View key={m} style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.accent, fontSize: 18,
                      fontWeight: '900' }}>
                      {Math.round(
                        (selected[m] || 0) * (parseFloat(servings) || 1)
                      )}
                      {m === 'calories' ? '' : 'g'}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 9,
                      textTransform: 'uppercase' }}>{m}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity onPress={handleLog}
                style={{ backgroundColor: colors.accent,
                  borderRadius: radius.button, padding: 16,
                  alignItems: 'center' }}>
                <Text style={{ color: '#0D0D0D', fontWeight: '900',
                  fontSize: font.md, textTransform: 'uppercase',
                  letterSpacing: 0.8 }}>Add to {mealType}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <BarcodeScanner
        visible={showScanner}
        onFound={(food) => {
          setShowScanner(false);
          if (food) setSelected(food);
          else Alert.alert('Not Found',
            'Product not in database. Add it manually.');
        }}
        onClose={() => setShowScanner(false)}
      />
    </Modal>
  );
};

export default FoodSearchModal;
