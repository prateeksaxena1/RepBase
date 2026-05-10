import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../constants/theme';
import * as Animatable from 'react-native-animatable';

const EmptyState = ({ icon, title, subtitle,
  buttonLabel, onButtonPress }) => (
  <Animatable.View animation="fadeIn" duration={600}
    style={{ flex: 1, alignItems: 'center',
      justifyContent: 'center', padding: 40 }}>
    <Animatable.View animation="pulse"
      iterationCount="infinite" duration={2000}>
      <Ionicons name={icon} size={56} color={colors.dim} />
    </Animatable.View>
    <Text style={{ color: colors.white, fontSize: font.xl,
      fontWeight: '800', marginTop: 20,
      textAlign: 'center' }}>{title}</Text>
    <Text style={{ color: colors.muted, fontSize: font.md,
      marginTop: 10, textAlign: 'center',
      lineHeight: 22 }}>{subtitle}</Text>
    {buttonLabel && (
      <TouchableOpacity onPress={onButtonPress}
        style={{ marginTop: 28, backgroundColor: colors.accent,
          paddingHorizontal: 28, paddingVertical: 14,
          borderRadius: radius.button }}>
        <Text style={{ color: '#0D0D0D', fontWeight: '900',
          fontSize: font.md, textTransform: 'uppercase',
          letterSpacing: 0.8 }}>{buttonLabel}</Text>
      </TouchableOpacity>
    )}
  </Animatable.View>
);

export default EmptyState;
