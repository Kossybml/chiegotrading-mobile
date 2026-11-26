import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { GoogleButton } from '@/components/GoogleButton';
import { Button, Input, Muted } from '@/components/ui';
import { ApiError, signInWith } from '@/lib/api';
import { colors, space } from '@/lib/theme';
import { failure, success } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

export default function Login() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const done = () => router.replace((next as any) || '/(tabs)');

  async function submit() {
    setError('');
    setBusy(true);
    try {
      await setSession(await signInWith('/auth/login/', { email: email.trim(), password }));
      success();
      done();
    } catch (e) {
      failure();
      if (e instanceof ApiError && e.code === 'email_not_verified') {
        router.push({ pathname: '/verify', params: { email: email.trim().toLowerCase(), next } });
      } else setError(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to track orders, pay online and manage your account.">
      <Input label="Email" icon="mail-outline" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" placeholder="you@example.com" />
      <Input label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" placeholder="Your password" onSubmitEditing={submit} returnKeyType="go" />
      {error ? <Text style={{ color: colors.danger, marginBottom: space.md }}>{error}</Text> : null}
      <Button title="Log in" loading={busy} disabled={!email || !password} onPress={submit} />
      <Pressable onPress={() => router.push('/forgot')} style={{ alignSelf: 'center', padding: space.md }}>
        <Text style={{ color: colors.green, fontWeight: '600' }}>Forgot password?</Text>
      </Pressable>
      <View style={{ height: space.sm }} />
      <GoogleButton onDone={done} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: space.xl }}>
        <Muted>New here?</Muted>
        <Pressable onPress={() => router.replace({ pathname: '/register', params: { next } })}>
          <Text style={{ color: colors.green, fontWeight: '600', fontSize: 13 }}>Create an account</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
