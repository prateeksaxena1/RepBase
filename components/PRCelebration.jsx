import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { colors, font, radius } from '../constants/theme';

const PRCelebration = ({ visible, exerciseName, weight, onClose }) => {
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, justifyContent: 'center',
        alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.85)' }}>
        <View style={{ backgroundColor: colors.surface,
          borderRadius: 20, padding: 32, alignItems: 'center',
          width: '80%', borderWidth: 2, borderColor: colors.accent }}>
          <Text style={{ fontSize: 48 }}>🏆</Text>
          <Text style={{ color: colors.accent, fontSize: 22,
            fontWeight: '900', marginTop: 12,
            textTransform: 'uppercase', letterSpacing: 1 }}>
            Personal Record!
          </Text>
          <Text style={{ color: colors.white, fontSize: font.lg,
            fontWeight: '700', marginTop: 8,
            textAlign: 'center' }}>{exerciseName}</Text>
          <Text style={{ color: colors.accent, fontSize: 36,
            fontWeight: '900', marginTop: 8 }}>{weight} kg</Text>
          <TouchableOpacity onPress={onClose}
            style={{ marginTop: 24, backgroundColor: colors.accent,
              borderRadius: radius.button, paddingHorizontal: 32,
              paddingVertical: 12 }}>
            <Text style={{ color: '#0D0D0D', fontWeight: '900',
              fontSize: font.md, textTransform: 'uppercase' }}>
              Let's Go! 💪
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PRCelebration;
