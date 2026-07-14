import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LineChart } from 'react-native-gifted-charts';
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
  const [daysRange, setDaysRange] = useState(30);

  const fetchWeightHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const logs = await getWeightHistory(user.id, 100);
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

  const normalizeWeight = (weight, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return weight;
    if (toUnit === 'lb') {
      return Math.round(weight * 2.20462 * 10) / 10;
    } else {
      return Math.round((weight / 2.20462) * 10) / 10;
    }
  };

  const renderTrendChart = () => {
    if (loading) return null;

    if (history.length === 0) {
      return (
        <View style={{
          backgroundColor: '#1A1A1A',
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: '#2A2A2A',
          alignItems: 'center',
          marginTop: 20,
        }}>
          <Ionicons name="trending-up-outline" size={32} color={colors.muted} style={{ marginBottom: 10 }} />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
            No Weight History Yet
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center', marginBottom: 14 }}>
            Log your weight to start tracking your trends over time.
          </Text>
        </View>
      );
    }

    // Filter by date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysRange);
    const filteredHistory = history.filter(
      (log) => new Date(log.logged_at) >= cutoffDate
    );

    // Normalize and map data in chronological order
    const chartData = [...filteredHistory]
      .reverse()
      .map((log) => ({
        value: normalizeWeight(log.weight, log.unit, unit),
        label: new Date(log.logged_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }));

    if (chartData.length === 0) {
      return (
        <View style={{
          backgroundColor: '#1A1A1A',
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: '#2A2A2A',
          alignItems: 'center',
          marginTop: 20,
        }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 }}>
            No Data in Last {daysRange} Days
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center', marginBottom: 14 }}>
            Try toggling the range or log a new entry.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => setDaysRange(30)}
              style={{
                backgroundColor: daysRange === 30 ? '#F5C518' : '#2A2A2A',
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 12,
              }}
            >
              <Text style={{ color: daysRange === 30 ? '#0D0D0D' : '#fff', fontWeight: '700', fontSize: 12 }}>
                30 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDaysRange(90)}
              style={{
                backgroundColor: daysRange === 90 ? '#F5C518' : '#2A2A2A',
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 12,
              }}
            >
              <Text style={{ color: daysRange === 90 ? '#0D0D0D' : '#fff', fontWeight: '700', fontSize: 12 }}>
                90 Days
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={{
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        marginTop: 20,
        alignItems: 'center',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>
            Weight Trend ({unit === 'lb' ? 'lbs' : 'kg'})
          </Text>
          {/* Days Range Toggle */}
          <View style={{ flexDirection: 'row', backgroundColor: '#2A2A2A', borderRadius: 8, padding: 2 }}>
            <TouchableOpacity
              onPress={() => setDaysRange(30)}
              style={{
                backgroundColor: daysRange === 30 ? '#F5C518' : 'transparent',
                borderRadius: 6,
                paddingVertical: 4,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: daysRange === 30 ? '#0D0D0D' : '#888', fontWeight: '800', fontSize: 11 }}>
                30D
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDaysRange(90)}
              style={{
                backgroundColor: daysRange === 90 ? '#F5C518' : 'transparent',
                borderRadius: 6,
                paddingVertical: 4,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: daysRange === 90 ? '#0D0D0D' : '#888', fontWeight: '800', fontSize: 11 }}>
                90D
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <LineChart
          data={chartData}
          color={colors.accent}
          thickness={3}
          dataPointsColor={colors.accent}
          dataPointsRadius={4}
          backgroundColor="transparent"
          xAxisColor={colors.border}
          yAxisColor={colors.border}
          yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.muted, fontSize: 9 }}
          hideRules
          curved={chartData.length >= 3}
          width={280}
          height={160}
        />
      </View>
    );
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

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Success Card */}
          <View style={{
            backgroundColor: '#1A1A1A',
            borderRadius: 16,
            padding: 30,
            borderWidth: 1.5,
            borderColor: '#F5C518',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 8,
            marginBottom: 20,
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

          {/* Weight Trend Chart */}
          {renderTrendChart()}
        </ScrollView>
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

        {/* Weight Trend Chart */}
        {renderTrendChart()}
      </ScrollView>
    </SafeAreaView>
  );
}
