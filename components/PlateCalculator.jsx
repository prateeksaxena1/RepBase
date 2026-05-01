import { View, Text, TextInput, TouchableOpacity,
  Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { colors, font, radius } from '../constants/theme';

const BAR_WEIGHT = 20; // standard olympic bar kg
const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATE_COLORS = {
  25: '#FF4444',
  20: '#4444FF', 
  15: '#FFFF44',
  10: '#44AA44',
  5: '#FFFFFF',
  2.5: '#FF8800',
  1.25: '#888888',
};

const calculatePlates = (targetWeight) => {
  let remaining = (targetWeight - BAR_WEIGHT) / 2;
  const result = [];

  if (remaining < 0) return [];

  PLATES.forEach((plate) => {
    const count = Math.floor(remaining / plate);
    if (count > 0) {
      result.push({ weight: plate, count });
      remaining -= plate * count;
      remaining = Math.round(remaining * 100) / 100;
    }
  });

  return result;
};

const PlateCalculator = ({ visible, onClose }) => {
  const [target, setTarget] = useState('');
  const plates = target && parseFloat(target) > BAR_WEIGHT
    ? calculatePlates(parseFloat(target)) : [];
  const achievable = plates.reduce(
    (sum, p) => sum + p.weight * p.count * 2, BAR_WEIGHT
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View style={{ backgroundColor: colors.surface,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 24 }}>
          <Text style={{ color: colors.white, fontSize: 20,
            fontWeight: '900', marginBottom: 4 }}>Plate Calculator</Text>
          <Text style={{ color: colors.muted, fontSize: font.sm,
            marginBottom: 20 }}>20kg Olympic bar · per side</Text>

          <TextInput
            value={target}
            onChangeText={setTarget}
            placeholder="Target weight (kg)"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
            style={{ backgroundColor: colors.dark, color: colors.white,
              borderRadius: radius.input, padding: 14,
              fontSize: font.xl, fontWeight: '900',
              borderWidth: 1, borderColor: colors.border,
              textAlign: 'center', marginBottom: 20 }}
          />

          {plates.length > 0 && (
            <>
              {/* Visual bar */}
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center',
                  flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
                  {plates.map((p) =>
                    Array(p.count).fill(0).map((_, i) => (
                      <View key={`${p.weight}-${i}`} style={{
                        width: 28,
                        height: 28 + p.weight,
                        backgroundColor: PLATE_COLORS[p.weight] || '#888',
                        borderRadius: 4,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.9,
                      }}>
                        <Text style={{ color: '#000', fontSize: 8,
                          fontWeight: '900' }}>{p.weight}</Text>
                      </View>
                    ))
                  )}
                  {/* Bar */}
                  <View style={{ width: 40, height: 12,
                    backgroundColor: '#666', borderRadius: 3,
                    alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff',
                      fontSize: 7, fontWeight: '700' }}>BAR</Text>
                  </View>
                </View>
              </View>

              {/* Plate list */}
              <View style={{ backgroundColor: colors.dark,
                borderRadius: radius.card, padding: 14,
                marginBottom: 16, borderWidth: 1,
                borderColor: colors.border }}>
                <Text style={{ color: colors.muted, fontSize: 10,
                  textTransform: 'uppercase', letterSpacing: 1,
                  marginBottom: 10 }}>Per side</Text>
                {plates.map((p) => (
                  <View key={p.weight} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row',
                      alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 14, height: 14,
                        borderRadius: 2,
                        backgroundColor: PLATE_COLORS[p.weight] }} />
                      <Text style={{ color: colors.white,
                        fontSize: font.md,
                        fontWeight: '700' }}>{p.weight} kg</Text>
                    </View>
                    <Text style={{ color: colors.muted,
                      fontSize: font.md }}>× {p.count}</Text>
                  </View>
                ))}
                <View style={{ borderTopWidth: 1,
                  borderTopColor: colors.border, marginTop: 8,
                  paddingTop: 8, flexDirection: 'row',
                  justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.muted,
                    fontSize: font.sm }}>Total on bar</Text>
                  <Text style={{ color: colors.accent,
                    fontSize: font.md, fontWeight: '900' }}>
                    {achievable} kg
                  </Text>
                </View>
              </View>

              {Math.abs(achievable - parseFloat(target)) > 0.1 && (
                <Text style={{ color: '#FF8800', fontSize: font.sm,
                  textAlign: 'center', marginBottom: 12 }}>
                  ⚠ Closest achievable: {achievable}kg
                  (not {target}kg)
                </Text>
              )}
            </>
          )}

          {target && parseFloat(target) <= BAR_WEIGHT && (
            <Text style={{ color: colors.muted, fontSize: font.sm,
              textAlign: 'center', marginBottom: 16 }}>
              Target must be greater than bar weight (20kg)
            </Text>
          )}

          <TouchableOpacity onPress={onClose}
            style={{ backgroundColor: colors.accent,
              borderRadius: radius.button, padding: 14,
              alignItems: 'center' }}>
            <Text style={{ color: '#0D0D0D', fontWeight: '900',
              fontSize: font.md, textTransform: 'uppercase' }}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PlateCalculator;
