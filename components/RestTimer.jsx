import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { colors, font, radius } from '../constants/theme';

const PRESETS = [45, 60, 90, 120, 180];

const RestTimer = ({ onSkip, defaultDuration = 90 }) => {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef(null);
  const animatedWidth = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startTimer(defaultDuration);
    return () => clearInterval(intervalRef.current);
  }, []);

  const startTimer = (secs) => {
    clearInterval(intervalRef.current);
    setTimeLeft(secs);
    setRunning(true);

    Animated.timing(animatedWidth, {
      toValue: 0,
      duration: secs * 1000,
      useNativeDriver: false,
    }).start();

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        if (prev <= 4) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePreset = (secs) => {
    animatedWidth.setValue(1);
    setDuration(secs);
    startTimer(secs);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: radius.card,
      padding: 20,
      marginVertical: 12,
      borderWidth: 1.5,
      borderColor: timeLeft === 0 ? colors.accent : colors.border,
    }}>
      <Text style={{
        color: colors.muted, fontSize: 10,
        textTransform: 'uppercase', letterSpacing: 1,
        marginBottom: 8,
      }}>Rest Timer</Text>

      {/* Progress bar */}
      <View style={{
        height: 4, backgroundColor: colors.border,
        borderRadius: 2, marginBottom: 16, overflow: 'hidden',
      }}>
        <Animated.View style={{
          height: 4,
          width: progress,
          backgroundColor: timeLeft === 0 ? colors.accent : '#F5C518',
          borderRadius: 2,
        }} />
      </View>

      {/* Countdown */}
      <Text style={{
        color: timeLeft === 0 ? colors.accent : colors.white,
        fontSize: 52, fontWeight: '900',
        textAlign: 'center', letterSpacing: -2,
        fontVariant: ['tabular-nums'],
      }}>
        {formatTime(timeLeft)}
      </Text>

      {timeLeft === 0 && (
        <Text style={{
          color: colors.accent, fontSize: font.sm,
          textAlign: 'center', fontWeight: '700',
          marginTop: 4, letterSpacing: 1,
          textTransform: 'uppercase',
        }}>Rest complete!</Text>
      )}

      {/* Preset buttons */}
      <View style={{
        flexDirection: 'row', justifyContent: 'center',
        gap: 8, marginTop: 16,
      }}>
        {PRESETS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => handlePreset(s)}
            style={{
              paddingHorizontal: 10, paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: duration === s ? colors.accent : colors.dark,
              borderWidth: 1,
              borderColor: duration === s ? colors.accent : colors.border,
            }}>
            <Text style={{
              color: duration === s ? '#0D0D0D' : colors.muted,
              fontSize: 11, fontWeight: '700',
            }}>{s}s</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Skip button */}
      <TouchableOpacity
        onPress={() => {
          clearInterval(intervalRef.current);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSkip();
        }}
        style={{
          marginTop: 14, padding: 12,
          borderRadius: radius.button,
          backgroundColor: colors.dark,
          borderWidth: 1, borderColor: colors.border,
          alignItems: 'center',
        }}>
        <Text style={{
          color: colors.muted, fontSize: font.sm,
          fontWeight: '700', textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}>Skip Rest</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RestTimer;
