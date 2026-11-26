import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { GoogleButton } from '@/components/GoogleButton';
import { Button, Chip, Input, Muted, Row } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { colors, space } from '@/lib/theme';
import type { User } from '@/lib/types';
import { failure } from '@/lib/utils';

export default function Register() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [f, setF] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '' });
  const [role, setRole] = useState<User['role']>('buyer');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((cur) => ({ ...cur, [k]: v }));

  async function submit() {
    setErrors({});
    setGeneral('');
    setBusy(true);
    try {
      await api('/auth/register/', { method: 'POST', auth: false, body: { ...f, email: f.email.trim(), role } });
      router.push({ pathname: '/verify', params: { email: f.email.trim().toLowerCase(), next } });
    } catch (e) {
      failure();
      if (e instanceof ApiError) {
        if (e.fields) setErrors(Object.fromEntries(Object.entries(e.fields).map(([k, v]) => [k, v[0]])));
        else setGeneral(e.message);
        if (e.code === 'email_taken') setGeneral('That email already has an account. Log in instead.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="We'll email you a 6-digit code to confirm your address.">
      <Row style={{ gap: space.sm, marginBottom: space.lg }}>
        <Chip label="I want to buy" icon="cart-outline" active={role === 'buyer'} onPress={() => setRole('buyer')} />
        <Chip label="I want to sell" icon="storefront-outline" active={role === 'seller'} onPress={() => setRole('seller')} />
      </Row>
      <Row style={{ gap: space.sm, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}><Input label="First name" value={f.first_name} onChangeText={set('first_name')} autoComplete="given-name" textContentType="givenName" error={errors.first_name} /></View>
        <View style={{ flex: 1 }}><Input label="Last name" value={f.last_name} onChangeText={set('last_name')} autoComplete="family-name" textContentType="familyName" error={errors.last_name} /></View>
      </Row>
      <Input label="Email" icon="mail-outline" value={f.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" autoComplete="email" textContentType="emailAddress" error={errors.email} />
      <Input label="Phone (optional)" icon="call-outline" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" error={errors.phone} />
      <Input label="Password" icon="lock-closed-outline" value={f.password} onChangeText={set('password')} secureTextEntry autoComplete="new-password" textContentType="newPassword" placeholder="At least 8 characters" error={errors.password} />
      {general ? <Text style={{ color: colors.danger, marginBottom: space.md }}>{general}</Text> : null}
      <Muted style={{ marginBottom: space.md }}>By continuing you agree to our Terms and Privacy Policy.</Muted>
      <Button title="Create account" loading={busy} disabled={!f.first_name || !f.email || !f.password} onPress={submit} />
      <View style={{ height: space.md }} />
      <GoogleButton role={role} onDone={() => router.replace((next as any) || '/(tabs)')} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: space.xl }}>
        <Muted>Already registered?</Muted>
        <Pressable onPress={() => router.replace({ pathname: '/login', params: { next } })}>
          <Text style={{ color: colors.green, fontWeight: '600', fontSize: 13 }}>Log in</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}
