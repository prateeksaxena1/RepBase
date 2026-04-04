import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../constants/theme';

const EmptyState = ({ icon, title, subtitle, buttonLabel, onButtonPress }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
    <Ionicons name={icon} size={48} color={colors.dim} />
    <Text style={{ color: colors.white, fontSize: font.lg, fontWeight: '800',
      marginTop: 16, textAlign: 'center' }}>{title}</Text>
    <Text style={{ color: colors.muted, fontSize: font.sm, marginTop: 8,
      textAlign: 'center', lineHeight: 20 }}>{subtitle}</Text>
    {buttonLabel && (
      <TouchableOpacity onPress={onButtonPress} style={{
        marginTop: 24, backgroundColor: colors.accent,
        paddingHorizontal: 24, paddingVertical: 14,
        borderRadius: radius.button,
      }}>
        <Text style={{ color: '#0D0D0D', fontWeight: '900',
          fontSize: font.md, textTransform: 'uppercase',
          letterSpacing: 0.8 }}>{buttonLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default EmptyState;
