import { router } from 'expo-router';
import { useState } from 'react';

import { AuthShell } from '@/components/AuthShell';
import { Button, Input } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { failure } from '@/lib/utils';
import { Text } from 'react-native';
import { colors } from '@/lib/theme';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    setError('');
    try {
      await api('/auth/password/forgot/', { method: 'POST', auth: false, body: { email: email.trim() } });
      router.replace({ pathname: '/reset', params: { email: email.trim().toLowerCase() } });
    } catch (e) {
      failure();
      setError(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send a code to choose a new one.">
      <Input label="Email" icon="mail-outline" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" onSubmitEditing={submit} />
      {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}
      <Button title="Send code" loading={busy} disabled={!email} onPress={submit} />
    </AuthShell>
  );
}
