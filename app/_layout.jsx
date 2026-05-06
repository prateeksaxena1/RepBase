import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import useAuthStore from '../store/useAuthStore';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../constants/theme';

export default function RootLayout() {
  useDatabase();
  const { user, loading, init } = useAuthStore();
  const segments = useSegments();

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'auth';
    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg,
        alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#0D0D0D" />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0D0D0D' },
        animation: 'slide_from_right',
      }} />
    </>
  );
}
