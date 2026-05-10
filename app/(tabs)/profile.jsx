import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import useAuthStore from '../../store/useAuthStore';
import { colors, font, radius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { loadDemoData } from '../../lib/demoData';
import { useRoute } from '@react-navigation/native';

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
      <Animatable.View animation="fadeInUp" duration={400} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20 }}>
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
            { label: 'Sync Data to Cloud', icon: 'cloud-upload-outline',
              onPress: async () => {
                if (!user) return Alert.alert('Not Logged In');
                try {
                  const { syncToCloud } = require('../../lib/sync');
                  await syncToCloud(user.id);
                  Alert.alert('Success', 'Data synced to Supabase ✓');
                } catch (e) {
                  Alert.alert('Sync Failed', e.message);
                }
              }
            },
            { label: 'Load Demo Data', icon: 'flask-outline',
              onPress: async () => {
                if (!user) return Alert.alert('Not Logged In');
                Alert.alert('Load Demo Data?', 'This will populate your app with sample routines, history, and nutrition logs.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Load', style: 'default',
                    onPress: async () => {
                      try {
                        const success = await loadDemoData(user.id);
                        if (success) Alert.alert('Success', 'Demo data loaded and synced! Restart the app to see all changes.');
                        else Alert.alert('Error', 'Failed to load demo data.');
                      } catch (e) {
                        Alert.alert('Error', e.message);
                      }
                    }
                  }
                ]);
              }
            },
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
        </ScrollView>
      </Animatable.View>
    </SafeAreaView>
  );
}
