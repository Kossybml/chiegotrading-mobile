import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { Button, Input } from '@/components/ui';
import { ApiError, signInWith } from '@/lib/api';
import { colors } from '@/lib/theme';
import { failure, success } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

export default function Reset() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const { setSession } = useAuth();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    setError('');
    try {
      await setSession(await signInWith('/auth/password/reset/', { email, code, new_password: password }));
      success();
      router.replace('/(tabs)');
    } catch (e) {
      failure();
      setError(e instanceof ApiError ? (e.fields?.new_password?.[0] ?? e.message) : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthShell title="Choose a new password" subtitle={`Enter the 6-digit code we sent to ${email}.`}>
      <Input label="Code" value={code} onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={6} placeholder="000000" />
      <Input label="New password" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" placeholder="At least 8 characters" />
      {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}
      <Button title="Save password and log in" loading={busy} disabled={code.length !== 6 || password.length < 8} onPress={submit} />
    </AuthShell>
  );
}
