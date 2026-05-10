import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useDatabase } from '../hooks/useDatabase';
import useAuthStore from '../store/useAuthStore';
import { colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  useDatabase();
  const { user, loading, init } = useAuthStore();
  const segments = useSegments();

  useEffect(() => {
    const prepare = async () => {
      try {
        await init();
      } finally {
        setAppReady(true);
      }
    };
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  useEffect(() => {
    if (!appReady || loading) return;
    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    if (!user && !inAuthGroup && !inOnboarding) {
      router.replace('/onboarding');
    } else if (user && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [user, loading, appReady, segments]);

  if (!appReady) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar style="light" backgroundColor="#0D0D0D" />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0D0D0D' },
        animation: 'slide_from_right',
      }} />
    </View>
  );
}
