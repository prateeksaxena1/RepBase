import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { colors, font, radius } from '../constants/theme';

const RoutineCard = ({ routine, onPress, onLongPress, index = 0 }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onLongPress) onLongPress();
  };

  return (
  <Animatable.View animation="fadeInUp" delay={index * 80} duration={300}>
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      onLongPress={handleLongPress}
    style={{
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: 14,
      marginBottom: 10,
      borderWidth: routine.is_active === 1 ? 1.5 : 1,
      borderColor: routine.is_active === 1 ? colors.accent : colors.border,
    }}
  >
    {routine.is_active === 1 && (
      <View style={{
        position: 'absolute', top: 10, right: 10,
        backgroundColor: colors.accent, borderRadius: radius.badge,
        paddingHorizontal: 8, paddingVertical: 3,
      }}>
        <Text style={{ color: '#0D0D0D', fontSize: 9,
          fontWeight: '900', letterSpacing: 0.5 }}>ACTIVE</Text>
      </View>
    )}
    <Text style={{ color: colors.white, fontSize: 15,
      fontWeight: '800', marginRight: routine.is_active ? 60 : 0 }}>
      {routine.name}
    </Text>
    {!!routine.description && (
      <Text numberOfLines={1} style={{ color: colors.muted,
        fontSize: 11, marginTop: 3 }}>{routine.description}</Text>
    )}
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
      {[`${routine.dayCount} days`, `${routine.exerciseCount} exercises`].map((tag) => (
        <View key={tag} style={{ backgroundColor: '#222',
          borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ color: colors.muted, fontSize: 9 }}>{tag}</Text>
        </View>
      ))}
    </View>
    </TouchableOpacity>
  </Animatable.View>
  );
};

export default RoutineCard;
