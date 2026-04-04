import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

const tabIcon = (name) => ({ color, size }) => (
  <Ionicons name={name} size={size} color={color} />
);

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.bg,
        borderTopColor: '#1E1E1E',
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.dim,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
    }}>
      <Tabs.Screen name="index"
        options={{ title: 'Home',
          tabBarIcon: tabIcon('home-outline') }} />
      <Tabs.Screen name="routines"
        options={{ title: 'Routines',
          tabBarIcon: tabIcon('list-outline') }} />
      <Tabs.Screen name="history"
        options={{ title: 'History',
          tabBarIcon: tabIcon('time-outline') }} />
      <Tabs.Screen name="progress"
        options={{ title: 'Progress',
          tabBarIcon: tabIcon('bar-chart-outline') }} />
    </Tabs>
  );
}
