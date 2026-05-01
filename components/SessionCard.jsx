import { View, Text, TouchableOpacity } from 'react-native';
import { colors, font, radius } from '../constants/theme';

const SessionCard = ({ session, onPress }) => {
  const formatDuration = (secs) => {
    if (!secs) return '--';
    const m = Math.floor(secs / 60);
    return `${m}m`;
  };

  return (
    <TouchableOpacity onPress={onPress} style={{
      backgroundColor: colors.surface, borderRadius: radius.card,
      padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.white, fontSize: font.md,
          fontWeight: '800' }}>{session.date}</Text>
        <Text style={{ color: colors.muted,
          fontSize: font.sm }}>{formatDuration(session.duration_secs)}</Text>
      </View>
      <Text style={{ color: colors.accent, fontSize: font.sm,
        marginTop: 4 }}>{session.routine_name || 'Free workout'}</Text>
      {!!session.notes && (
        <Text numberOfLines={1} style={{ color: colors.muted,
          fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>
          "{session.notes}"
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default SessionCard;
