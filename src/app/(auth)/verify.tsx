import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { Button, Input } from '@/components/ui';
import { api, ApiError, signInWith } from '@/lib/api';
import { useMeta } from '@/lib/queries';
import { colors, space } from '@/lib/theme';
import { failure, success } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

export default function Verify() {
  const { email = '', next } = useLocalSearchParams<{ email?: string; next?: string }>();
  const { setSession } = useAuth();
  const meta = useMeta();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(meta.data?.otp.resend_seconds ?? 60);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function submit(value = code) {
    if (value.length !== 6) return;
    setError('');
    setBusy(true);
    try {
      await setSession(await signInWith('/auth/verify-email/', { email, code: value }));
      success();
      router.replace((next as any) || '/(tabs)');
    } catch (e) {
      failure();
      setError(e instanceof ApiError ? e.message : 'Something went wrong.');
      setCode('');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    try {
      await api('/auth/resend-code/', { method: 'POST', auth: false, body: { email } });
      setWait(meta.data?.otp.resend_seconds ?? 60);
      Alert.alert('Code sent', 'Check your inbox (and spam folder).');
    } catch (e) {
      Alert.alert('Could not resend', e instanceof ApiError ? e.message : 'Try again.');
    }
  }

  return (
    <AuthShell title="Check your email" subtitle={`We sent a 6-digit code to ${email}. It expires in ${meta.data?.otp.lifetime_minutes ?? 10} minutes.`}>
      <Input
        value={code}
        onChangeText={(v) => {
          const d = v.replace(/\D/g, '').slice(0, 6);
          setCode(d);
          if (d.length === 6) void submit(d); // submit as soon as the last digit lands (also after autofill)
        }}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={6}
        autoFocus
        placeholder="000000"
        style={{ fontSize: 28, letterSpacing: 10, textAlign: 'center', fontWeight: '600' }}
        error={error}
      />
      <Button title="Verify and continue" loading={busy} disabled={code.length !== 6} onPress={() => submit()} />
      <Pressable disabled={wait > 0} onPress={resend} style={{ alignSelf: 'center', padding: space.lg }}>
        <Text style={{ color: wait > 0 ? colors.muted : colors.green, fontWeight: '600' }}>{wait > 0 ? `Send a new code in ${wait}s` : 'Send a new code'}</Text>
      </Pressable>
    </AuthShell>
  );
}
