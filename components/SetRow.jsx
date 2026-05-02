import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../constants/theme';
import { useState } from 'react';

const SetRow = ({ setNumber, reps, weight, onRepsChange, onWeightChange, onComplete, completed, prevSet, setType = 'normal', onTypeChange, rpe, onRpeChange }) => {
  const [expanded, setExpanded] = useState(false);

  const typeConfig = {
    warmup: { label: 'W', color: '#888888' },
    normal: { label: 'N', color: '#F5C518' },
    dropset: { label: 'D', color: '#FF8800' },
    failure: { label: 'F', color: '#FF4444' }
  };

  const nextType = {
    warmup: 'normal',
    normal: 'dropset',
    dropset: 'failure',
    failure: 'warmup'
  };

  const handleTypeCycle = () => {
    if (onTypeChange) {
      onTypeChange(nextType[setType] || 'normal');
    }
  };

  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TouchableOpacity onPress={handleTypeCycle} style={{
          width: 24, height: 24, borderRadius: 12,
          backgroundColor: typeConfig[setType]?.color || typeConfig.normal.color,
          alignItems: 'center', justifyContent: 'center'
        }}>
          <Text style={{ color: '#0D0D0D', fontSize: 12, fontWeight: '900' }}>
            {typeConfig[setType]?.label || typeConfig.normal.label}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: colors.muted, fontSize: font.sm,
          width: 24, textAlign: 'center' }}>{setNumber}</Text>
        <TextInput
          value={weight}
          onChangeText={onWeightChange}
          placeholder={prevSet ? `${prevSet.weight_kg}` : 'kg'}
          placeholderTextColor={colors.dim}
          keyboardType="numeric"
          style={{ flex: 1, backgroundColor: colors.dark, color: colors.white,
            borderRadius: radius.input, padding: 10, fontSize: font.md,
            borderWidth: 1, borderColor: colors.border, textAlign: 'center' }}
        />
        <TextInput
          value={reps}
          onChangeText={onRepsChange}
          placeholder={prevSet ? `${prevSet.reps}` : 'reps'}
          placeholderTextColor={colors.dim}
          keyboardType="numeric"
          style={{ flex: 1, backgroundColor: colors.dark, color: colors.white,
            borderRadius: radius.input, padding: 10, fontSize: font.md,
            borderWidth: 1, borderColor: colors.border, textAlign: 'center' }}
        />
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ padding: 4 }}>
          <Ionicons name={expanded ? "remove" : "add"} size={18} color={colors.muted} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onComplete} style={{
          width: 36, height: 36, borderRadius: 18,
          backgroundColor: completed ? colors.accent : colors.border,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="checkmark" size={18}
            color={completed ? '#0D0D0D' : colors.muted} />
        </TouchableOpacity>
      </View>
      {expanded && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, justifyContent: 'flex-end', paddingRight: 44 }}>
          <Text style={{ color: colors.muted, fontSize: font.sm }}>RPE</Text>
          <TextInput
            value={rpe}
            onChangeText={onRpeChange}
            placeholder="-"
            placeholderTextColor={colors.dim}
            keyboardType="numeric"
            style={{ width: 50, backgroundColor: colors.dark, color: colors.white,
              borderRadius: radius.input, padding: 8, fontSize: font.md,
              borderWidth: 1, borderColor: colors.border, textAlign: 'center' }}
          />
        </View>
      )}
    </View>
  );
};

export default SetRow;
