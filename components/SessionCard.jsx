import { View, Text, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { colors, font, radius } from '../constants/theme';

const SessionCard = ({ session, onPress, index = 0 }) => {
  const formatDuration = (secs) => {
    if (!secs) return '--';
    const m = Math.floor(secs / 60);
    return `${m}m`;
  };

  return (
    <Animatable.View animation="fadeInUp" delay={index * 80} duration={300}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{
      backgroundColor: colors.surface, borderRadius: radius.card,
      padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.white, fontSize: font.md,
          fontWeight: '800' }}>{session.date}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {session.pr_count > 0 && (
            <View style={{ backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: '#0D0D0D', fontSize: 10, fontWeight: '900' }}>🏆 {session.pr_count} PRs</Text>
            </View>
          )}
          <Text style={{ color: colors.muted,
            fontSize: font.sm }}>{formatDuration(session.duration_secs)}</Text>
        </View>
      </View>
      <Text style={{ color: colors.accent, fontSize: font.sm,
        marginTop: 4 }}>{session.routine_name || 'Free workout'}</Text>
      
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>
        {session.total_sets || 0} sets · {session.total_volume || 0}kg volume
      </Text>

      {!!session.notes && (
        <Text numberOfLines={1} style={{ color: colors.muted,
          fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>
          "{session.notes}"
        </Text>
      )}
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default SessionCard;
