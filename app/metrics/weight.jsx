import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { logWeight, getWeightHistory } from '../../db/bodyMetrics';
import useAuthStore from '../../store/useAuthStore';
import { colors, font, radius } from '../../constants/theme';

export default function WeightCheckIn() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayLog, setTodayLog] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [unit, setUnit] = useState('kg');
  const [success, setSuccess] = useState(false);

  const fetchWeightHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const logs = await getWeightHistory(user.id, 50);
      setHistory(logs);
      
      const todayStr = new Date().toLocaleDateString('en-CA');
      const foundToday = logs.find(
        (log) => new Date(log.logged_at).toLocaleDateString('en-CA') === todayStr
      );
      setTodayLog(foundToday || null);
      
      if (foundToday) {
        setInputValue(String(foundToday.weight));
        setUnit(foundToday.unit);
      } else if (logs.length > 0) {
        setUnit(logs[0].unit);
      }
    } catch (error) {
      console.error('[RepBase Weight error]', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchWeightHistory();
    }, [fetchWeightHistory])
  );

  const handleKeyPress = (val) => {
    if (val === '⌫') {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (val === '.') {
      if (!inputValue.includes('.')) {
        setInputValue((prev) => (prev === '' ? '0.' : prev + '.'));
      }
    } else {
      if (inputValue === '0' && val === '0') return;
      if (inputValue === '0' && val !== '0') {
        setInputValue(val);
      } else {
        if (inputValue.length < 6) {
          setInputValue((prev) => prev + val);
        }
      }
    }
  };

  const handleLogWeight = async () => {
    const weightNum = parseFloat(inputValue);
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }

    try {
      setSuccess(true);
      await logWeight(user.id, weightNum, unit, '');
      setTimeout(() => {
        setSuccess(false);
        setIsEditing(false);
        fetchWeightHistory();
      }, 1500);
    } catch (error) {
      setSuccess(false);
      Alert.alert('Error', 'Failed to log weight. Please try again.');
      console.error(error);
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫']
  ];

  if (!user) return null;

  if (success) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Animatable.View animation="bounceIn" duration={800} style={{ alignItems: 'center' }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#F5C518',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20
          }}>
            <Ionicons name="checkmark" size={48} color="#0D0D0D" />
          </View>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 }}>
            Weight Logged!
          </Text>
          <Text style={{ color: colors.muted, fontSize: 16 }}>
            {inputValue} {unit}
          </Text>
        </Animatable.View>
      </SafeAreaView>
    );
  }

  if (todayLog && !isEditing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={{ color: colors.white, fontSize: 20, fontWeight: '900', flex: 1 }}>
            Weight Check-In
          </Text>
        </View>

        {/* Success Card Centered */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{
            backgroundColor: '#1A1A1A',
            borderRadius: 16,
            padding: 30,
            borderWidth: 1.5,
            borderColor: '#F5C518',
            width: '100%',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 8,
          }}>
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#F5C518',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Text style={{ fontSize: 36 }}>⚖️</Text>
            </View>

            <Text style={{ color: '#888', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
              Logged Today
            </Text>

            <Text style={{ color: '#fff', fontSize: 36, fontWeight: '900', marginBottom: 20 }}>
              {todayLog.weight} {todayLog.unit === 'lb' ? 'lbs' : 'kg'}
            </Text>

            <View style={{ width: '100%', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setInputValue(String(todayLog.weight));
                  setUnit(todayLog.unit);
                  setIsEditing(true);
                }}
                style={{
                  backgroundColor: '#2A2A2A',
                  borderRadius: radius.button,
                  padding: 16,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#444',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: font.md, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Edit Weight
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: radius.button,
                  padding: 16,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#F5C518', fontWeight: '900', fontSize: font.md, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={{ color: colors.white, fontSize: 20, fontWeight: '900', flex: 1 }}>
          Weight Check-In
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 30 }}>
          <Text style={{ color: colors.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Enter Current Weight
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 10 }}>
            <Text style={{ color: '#fff', fontSize: 56, fontWeight: '900' }}>
              {inputValue || '0'}
            </Text>
            <Text style={{ color: '#F5C518', fontSize: 24, fontWeight: '800', marginLeft: 8 }}>
              {unit === 'lb' ? 'lbs' : 'kg'}
            </Text>
          </View>
        </View>

        <View>
          {/* Unit Toggle */}
          <View style={{
            flexDirection: 'row',
            backgroundColor: '#1A1A1A',
            borderRadius: radius.card,
            padding: 4,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#2A2A2A'
          }}>
            <TouchableOpacity
              onPress={() => setUnit('kg')}
              style={{
                flex: 1,
                backgroundColor: unit === 'kg' ? '#F5C518' : 'transparent',
                borderRadius: radius.card - 2,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: unit === 'kg' ? '#0D0D0D' : '#fff', fontWeight: '800', fontSize: font.md }}>
                KG
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setUnit('lb')}
              style={{
                flex: 1,
                backgroundColor: unit === 'lb' ? '#F5C518' : 'transparent',
                borderRadius: radius.card - 2,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: unit === 'lb' ? '#0D0D0D' : '#fff', fontWeight: '800', fontSize: font.md }}>
                LBS
              </Text>
            </TouchableOpacity>
          </View>

          {/* Keypad */}
          <View style={{ gap: 10, marginBottom: 20 }}>
            {keys.map((row, rIdx) => (
              <View key={rIdx} style={{ flexDirection: 'row', gap: 10 }}>
                {row.map((key) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => handleKeyPress(key)}
                    style={{
                      flex: 1,
                      backgroundColor: '#1A1A1A',
                      borderRadius: 12,
                      height: 64,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#2A2A2A',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>
                      {key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={handleLogWeight}
            style={{
              backgroundColor: '#F5C518',
              borderRadius: radius.button,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#0D0D0D', fontWeight: '900', fontSize: font.md, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Log Weight
            </Text>
          </TouchableOpacity>

          {todayLog ? (
            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              style={{
                backgroundColor: 'transparent',
                borderRadius: radius.button,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: colors.muted, fontWeight: '800', fontSize: font.sm, textTransform: 'uppercase' }}>
                Cancel Edit
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
