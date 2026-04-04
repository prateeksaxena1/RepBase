import { View, Text } from 'react-native';
import { colors, font, radius } from '../constants/theme';

const ExerciseCard = ({ exercise, lastWeight, isHighlighted }) => (
  <View style={{
    backgroundColor: colors.surface, borderRadius: radius.card,
    padding: 12, marginBottom: 8,
    borderLeftWidth: isHighlighted ? 3 : 0,
    borderLeftColor: colors.accent,
    borderWidth: 1, borderColor: colors.border,
  }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View>
        <Text style={{ color: colors.white, fontSize: font.md,
          fontWeight: '700' }}>{exercise.name}</Text>
        <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>
          {exercise.target_sets} sets · {exercise.target_reps} reps
        </Text>
      </View>
      {lastWeight != null && (
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: colors.accent, fontSize: font.md,
            fontWeight: '700' }}>{lastWeight} kg</Text>
          <Text style={{ color: colors.dim, fontSize: 9,
            marginTop: 2 }}>last session</Text>
        </View>
      )}
    </View>
  </View>
);

export default ExerciseCard;
