import { View, Text, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import useAuthStore from '../../store/useAuthStore';
import { colors, font, radius } from '../../constants/theme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim())
      return Alert.alert('Missing fields', 'Enter email and password.');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Login failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 28,
          justifyContent: 'center' }}>

          {/* Logo */}
          <Text style={{ color: colors.accent, fontSize: 36,
            fontWeight: '900', letterSpacing: -1,
            marginBottom: 4 }}>RepBase</Text>
          <Text style={{ color: colors.muted, fontSize: font.md,
            marginBottom: 48 }}>
            The only gym app you'll ever need.
          </Text>

          {/* Inputs */}
          <Text style={{ color: colors.muted, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: 0.5,
            marginBottom: 6 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.dim}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ backgroundColor: colors.surface,
              color: colors.white, borderRadius: radius.input,
              padding: 14, fontSize: font.md,
              borderWidth: 1, borderColor: colors.border,
              marginBottom: 16 }}
          />

          <Text style={{ color: colors.muted, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: 0.5,
            marginBottom: 6 }}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.dim}
            secureTextEntry
            style={{ backgroundColor: colors.surface,
              color: colors.white, borderRadius: radius.input,
              padding: 14, fontSize: font.md,
              borderWidth: 1, borderColor: colors.border,
              marginBottom: 8 }}
          />

          <TouchableOpacity
            onPress={() => router.push('/auth/forgot-password')}
            style={{ alignSelf: 'flex-end', marginBottom: 32 }}>
            <Text style={{ color: colors.accent,
              fontSize: font.sm }}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity onPress={handleLogin}
            disabled={loading}
            style={{ backgroundColor: loading
              ? colors.dim : colors.accent,
              borderRadius: radius.button, padding: 16,
              alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#0D0D0D', fontWeight: '900',
              fontSize: font.md, textTransform: 'uppercase',
              letterSpacing: 0.8 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <View style={{ flexDirection: 'row',
            justifyContent: 'center', gap: 6 }}>
            <Text style={{ color: colors.muted,
              fontSize: font.sm }}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/signup')}>
              <Text style={{ color: colors.accent,
                fontSize: font.sm, fontWeight: '700' }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
