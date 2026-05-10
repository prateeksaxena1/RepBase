import { View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { colors, radius } from '../constants/theme';

const SkeletonCard = ({ height = 80 }) => (
  <Animatable.View
    animation="pulse"
    iterationCount="infinite"
    duration={1200}
    style={{ backgroundColor: colors.surface,
      borderRadius: radius.card, height,
      marginBottom: 10, borderWidth: 1,
      borderColor: colors.border, overflow: 'hidden' }}>
    <View style={{ position: 'absolute', top: 14,
      left: 14, right: 60, height: 14,
      backgroundColor: colors.border,
      borderRadius: 7 }} />
    <View style={{ position: 'absolute', top: 38,
      left: 14, width: 120, height: 10,
      backgroundColor: colors.border,
      borderRadius: 5 }} />
    <View style={{ position: 'absolute', top: 14,
      right: 14, width: 40, height: 40,
      backgroundColor: colors.border,
      borderRadius: 8 }} />
  </Animatable.View>
);

export default SkeletonCard;
