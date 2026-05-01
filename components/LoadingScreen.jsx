import { View, ActivityIndicator, Text } from 'react-native';
import { colors, font } from '../constants/theme';

const LoadingScreen = ({ message = 'Loading...' }) => (
  <View style={{ flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center', gap: 16 }}>
    <ActivityIndicator size="large" color={colors.accent} />
    <Text style={{ color: colors.muted, fontSize: font.sm,
      letterSpacing: 0.5 }}>{message}</Text>
  </View>
);

export default LoadingScreen;
