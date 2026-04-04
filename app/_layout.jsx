import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { useDatabase } from '../hooks/useDatabase';

export default function RootLayout() {
  const isReady = useDatabase();

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#F5C518" />
        <Text style={{ color: '#888', marginTop: 12, fontSize: 12 }}>Loading RepBase…</Text>
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
