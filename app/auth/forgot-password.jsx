import { View, Text, TextInput, TouchableOpacity,
  Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import useAuthStore from '../../store/useAuthStore';
import { colors, font, radius } from '../../constants/theme';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuthStore();

  const handleReset = async () => {
    if (!email.trim())
      return Alert.alert('Enter your email address.');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, padding: 28, justifyContent: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}
          style={{ marginBottom: 32 }}>
          <Text style={{ color: colors.muted,
            fontSize: font.md }}>← Back</Text>
        </TouchableOpacity>

        <Text style={{ color: colors.white, fontSize: 28,
          fontWeight: '900', marginBottom: 8 }}>
          Reset Password
        </Text>
        <Text style={{ color: colors.muted, fontSize: font.md,
          marginBottom: 40 }}>
          We'll send a reset link to your email.
        </Text>

        {!sent ? (
          <>
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
                marginBottom: 24 }}
            />
            <TouchableOpacity onPress={handleReset}
              disabled={loading}
              style={{ backgroundColor: loading
                ? colors.dim : colors.accent,
                borderRadius: radius.button, padding: 16,
                alignItems: 'center' }}>
              <Text style={{ color: '#0D0D0D', fontWeight: '900',
                fontSize: font.md, textTransform: 'uppercase' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ backgroundColor: colors.surface,
            borderRadius: radius.card, padding: 20,
            borderWidth: 1, borderColor: colors.accent,
            alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>📧</Text>
            <Text style={{ color: colors.white, fontSize: font.lg,
              fontWeight: '800', textAlign: 'center' }}>
              Check your email
            </Text>
            <Text style={{ color: colors.muted, fontSize: font.sm,
              textAlign: 'center', marginTop: 8 }}>
              Reset link sent to {email}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}
              style={{ marginTop: 20, backgroundColor: colors.accent,
                borderRadius: radius.button, paddingHorizontal: 32,
                paddingVertical: 12 }}>
              <Text style={{ color: '#0D0D0D', fontWeight: '900',
                fontSize: font.md }}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
