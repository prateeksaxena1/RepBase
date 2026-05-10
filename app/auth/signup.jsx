import { View, Text, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { router } from 'expo-router';
import useAuthStore from '../../store/useAuthStore';
import { colors, font, radius } from '../../constants/theme';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthStore();

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password.trim())
      return Alert.alert('Missing fields', 'Fill in all fields.');
    if (username.trim().length < 3)
      return Alert.alert('Username too short',
        'Username must be at least 3 characters.');
    if (password.length < 6)
      return Alert.alert('Weak password',
        'Password must be at least 6 characters.');
    if (password !== confirm)
      return Alert.alert('Passwords do not match',
        'Please re-enter your password.');
    setLoading(true);
    try {
      await signUp(email.trim(), password, username.trim());
      router.replace('/onboarding/setup');
    } catch (e) {
      Alert.alert('Signup failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 28 }}>
          <TouchableOpacity onPress={() => router.back()}
            style={{ marginBottom: 32 }}>
            <Text style={{ color: colors.muted,
              fontSize: font.md }}>← Back</Text>
          </TouchableOpacity>

          <Text style={{ color: colors.accent, fontSize: 32,
            fontWeight: '900', letterSpacing: -1,
            marginBottom: 4 }}>Create Account</Text>
          <Text style={{ color: colors.muted, fontSize: font.md,
            marginBottom: 40 }}>Join RepBase. Train smarter.</Text>

          {[
            { label: 'Username', value: username,
              onChange: setUsername, placeholder: 'yourname',
              autoCapitalize: 'none' },
            { label: 'Email', value: email,
              onChange: setEmail, placeholder: 'you@example.com',
              keyboardType: 'email-address', autoCapitalize: 'none' },
            { label: 'Password', value: password,
              onChange: setPassword, placeholder: '••••••••',
              secure: true },
            { label: 'Confirm Password', value: confirm,
              onChange: setConfirm, placeholder: '••••••••',
              secure: true },
          ].map((field) => (
            <View key={field.label} style={{ marginBottom: 16 }}>
              <Text style={{ color: colors.muted, fontSize: 11,
                textTransform: 'uppercase', letterSpacing: 0.5,
                marginBottom: 6 }}>{field.label}</Text>
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder={field.placeholder}
                placeholderTextColor={colors.dim}
                secureTextEntry={field.secure}
                autoCapitalize={field.autoCapitalize || 'words'}
                keyboardType={field.keyboardType || 'default'}
                style={{ backgroundColor: colors.surface,
                  color: colors.white, borderRadius: radius.input,
                  padding: 14, fontSize: font.md,
                  borderWidth: 1, borderColor: colors.border }}
              />
            </View>
          ))}

          <TouchableOpacity onPress={handleSignup}
            disabled={loading}
            style={{ backgroundColor: loading
              ? colors.dim : colors.accent,
              borderRadius: radius.button, padding: 16,
              alignItems: 'center', marginTop: 16 }}>
            <Text style={{ color: '#0D0D0D', fontWeight: '900',
              fontSize: font.md, textTransform: 'uppercase',
              letterSpacing: 0.8 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
