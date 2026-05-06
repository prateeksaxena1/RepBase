import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import useAuthStore from '../../store/useAuthStore';
import { colors, font, radius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth/login');
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ color: colors.white, fontSize: 28,
          fontWeight: '900', marginBottom: 32 }}>Profile</Text>

        {/* User info */}
        <View style={{ backgroundColor: colors.surface,
          borderRadius: radius.card, padding: 20,
          borderWidth: 1, borderColor: colors.border,
          alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 72, height: 72,
            borderRadius: 36, backgroundColor: colors.accent,
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 12 }}>
            <Text style={{ color: '#0D0D0D', fontSize: 28,
              fontWeight: '900' }}>
              {user?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={{ color: colors.white, fontSize: font.lg,
            fontWeight: '800' }}>
            {user?.user_metadata?.username || 'Athlete'}
          </Text>
          <Text style={{ color: colors.muted,
            fontSize: font.sm, marginTop: 4 }}>{user?.email}</Text>
        </View>

        {/* Menu items */}
        {[
          { label: 'Nutrition Goals', icon: 'nutrition-outline',
            onPress: () => router.push('/nutrition/goals') },
          { label: 'Export Data', icon: 'download-outline',
            onPress: () => Alert.alert('Coming soon') },
          { label: 'About RepBase', icon: 'information-circle-outline',
            onPress: () => Alert.alert('RepBase v1.0',
              'The only gym app you\'ll ever need.') },
        ].map((item) => (
          <TouchableOpacity key={item.label} onPress={item.onPress}
            style={{ backgroundColor: colors.surface,
              borderRadius: radius.card, padding: 16,
              borderWidth: 1, borderColor: colors.border,
              flexDirection: 'row', alignItems: 'center',
              gap: 12, marginBottom: 10 }}>
            <Ionicons name={item.icon} size={22}
              color={colors.muted} />
            <Text style={{ color: colors.white, fontSize: font.md,
              fontWeight: '700', flex: 1 }}>{item.label}</Text>
            <Ionicons name="chevron-forward"
              size={16} color={colors.dim} />
          </TouchableOpacity>
        ))}

        {/* Sign out */}
        <TouchableOpacity onPress={handleSignOut}
          style={{ backgroundColor: colors.surface,
            borderRadius: radius.card, padding: 16,
            borderWidth: 1, borderColor: '#FF4444',
            flexDirection: 'row', alignItems: 'center',
            gap: 12, marginTop: 8 }}>
          <Ionicons name="log-out-outline" size={22}
            color="#FF4444" />
          <Text style={{ color: '#FF4444', fontSize: font.md,
            fontWeight: '700' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
