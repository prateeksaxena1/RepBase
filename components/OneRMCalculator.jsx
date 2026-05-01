import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { colors, font, radius } from '../constants/theme';

// Epley formula: 1RM = weight × (1 + reps/30)
const calc1RM = (weight, reps) => {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

// Percentage table
const PERCENTAGES = [
  { pct: 100, reps: 1 },
  { pct: 95,  reps: 2 },
  { pct: 90,  reps: 3 },
  { pct: 85,  reps: 5 },
  { pct: 80,  reps: 6 },
  { pct: 75,  reps: 8 },
  { pct: 70,  reps: 10 },
  { pct: 65,  reps: 12 },
  { pct: 60,  reps: 15 },
];

const OneRMCalculator = ({ visible, onClose }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const oneRM = weight && reps
    ? calc1RM(parseFloat(weight), parseInt(reps)) : null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View style={{ backgroundColor: colors.surface,
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: 24 }}>

          <Text style={{ color: colors.white, fontSize: 20,
            fontWeight: '900', marginBottom: 4 }}>1RM Calculator</Text>
          <Text style={{ color: colors.muted, fontSize: font.sm,
            marginBottom: 20 }}>Epley formula estimate</Text>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 11,
                marginBottom: 6, textTransform: 'uppercase',
                letterSpacing: 0.5 }}>Weight (kg)</Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="e.g. 100"
                placeholderTextColor={colors.dim}
                keyboardType="numeric"
                style={{ backgroundColor: colors.dark, color: colors.white,
                  borderRadius: radius.input, padding: 14,
                  fontSize: font.lg, fontWeight: '700',
                  borderWidth: 1, borderColor: colors.border,
                  textAlign: 'center' }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 11,
                marginBottom: 6, textTransform: 'uppercase',
                letterSpacing: 0.5 }}>Reps</Text>
              <TextInput
                value={reps}
                onChangeText={setReps}
                placeholder="e.g. 5"
                placeholderTextColor={colors.dim}
                keyboardType="numeric"
                style={{ backgroundColor: colors.dark, color: colors.white,
                  borderRadius: radius.input, padding: 14,
                  fontSize: font.lg, fontWeight: '700',
                  borderWidth: 1, borderColor: colors.border,
                  textAlign: 'center' }}
              />
            </View>
          </View>

          {oneRM && (
            <>
              <View style={{ backgroundColor: colors.dark,
                borderRadius: radius.card, padding: 16,
                alignItems: 'center', marginBottom: 16,
                borderWidth: 1.5, borderColor: colors.accent }}>
                <Text style={{ color: colors.muted, fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: 1 }}>
                  Estimated 1RM
                </Text>
                <Text style={{ color: colors.accent, fontSize: 44,
                  fontWeight: '900', marginTop: 4 }}>{oneRM} kg</Text>
              </View>

              <View style={{ backgroundColor: colors.dark,
                borderRadius: radius.card, overflow: 'hidden',
                marginBottom: 20, borderWidth: 1,
                borderColor: colors.border }}>
                {PERCENTAGES.map((row, i) => (
                  <View key={row.pct} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 10, paddingHorizontal: 14,
                    backgroundColor: i % 2 === 0 ? colors.dark : '#161616',
                    borderBottomWidth: i < PERCENTAGES.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}>
                    <Text style={{ color: colors.muted,
                      fontSize: font.sm }}>{row.pct}% · {row.reps} rep{row.reps > 1 ? 's' : ''}</Text>
                    <Text style={{ color: colors.white,
                      fontSize: font.sm, fontWeight: '700' }}>
                      {Math.round(oneRM * row.pct / 100)} kg
                    </Text>
                  </View>
                ))}
              </View>
            </>
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

export default OneRMCalculator;
