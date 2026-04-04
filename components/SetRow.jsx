import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../constants/theme';

const SetRow = ({ setNumber, reps, weight, onRepsChange, onWeightChange, onComplete, completed }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 8 }}>
    <Text style={{ color: colors.muted, fontSize: font.sm,
      width: 24, textAlign: 'center' }}>{setNumber}</Text>
    <TextInput
      value={weight}
      onChangeText={onWeightChange}
      placeholder="kg"
      placeholderTextColor={colors.dim}
      keyboardType="numeric"
      style={{ flex: 1, backgroundColor: colors.dark, color: colors.white,
        borderRadius: radius.input, padding: 10, fontSize: font.md,
        borderWidth: 1, borderColor: colors.border, textAlign: 'center' }}
    />
    <TextInput
      value={reps}
      onChangeText={onRepsChange}
      placeholder="reps"
      placeholderTextColor={colors.dim}
      keyboardType="numeric"
      style={{ flex: 1, backgroundColor: colors.dark, color: colors.white,
        borderRadius: radius.input, padding: 10, fontSize: font.md,
        borderWidth: 1, borderColor: colors.border, textAlign: 'center' }}
    />
    <TouchableOpacity onPress={onComplete} style={{
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: completed ? colors.accent : colors.border,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Ionicons name="checkmark" size={18}
        color={completed ? '#0D0D0D' : colors.muted} />
    </TouchableOpacity>
  </View>
);

export default SetRow;
