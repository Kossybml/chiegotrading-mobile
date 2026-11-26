import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Avatar, Button, Input, Muted, Row, Screen } from '@/components/ui';
import { api, ApiError, imagePart } from '@/lib/api';
import { choosePhoto } from '@/lib/photo';
import { space } from '@/lib/theme';
import type { User } from '@/lib/types';
import { failure, success } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const [f, setF] = useState({ first_name: user?.first_name ?? '', last_name: user?.last_name ?? '', phone: user?.phone ?? '', company: user?.company ?? '' });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  if (!user) return null;

  async function uploadAvatar(uri: string) {
    const form = new FormData();
    form.append('avatar', imagePart(uri, 'avatar') as any);
    try {
      setUser(await api<User>('/me/avatar/', { method: 'PUT', form }));
      success();
    } catch (e) {
      failure();
      Alert.alert('Could not upload', e instanceof ApiError ? e.message : 'Try again.');
    }
  }

  async function save() {
    setBusy(true);
    setErrors({});
    try {
      setUser(await api<User>('/me/', { method: 'PATCH', body: f }));
      success();
      Alert.alert('Saved');
    } catch (e) {
      failure();
      if (e instanceof ApiError) setErrors(e.fields ?? {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginBottom: space.lg, gap: space.sm }}>
        <Pressable accessibilityLabel="Change profile photo" onPress={() => choosePhoto(uploadAvatar)}>
          <Avatar uri={user.avatar} initials={user.initials} size={96} />
        </Pressable>
        <Row style={{ gap: space.md }}>
          <Button title="Change photo" variant="ghost" icon="camera-outline" onPress={() => choosePhoto(uploadAvatar)} />
          {user.avatar ? <Button title="Remove" variant="ghost" onPress={async () => setUser(await api<User>('/me/avatar/', { method: 'DELETE' }))} /> : null}
        </Row>
      </View>
      <Input label="First name" value={f.first_name} onChangeText={set('first_name')} error={errors.first_name?.[0]} textContentType="givenName" />
      <Input label="Last name" value={f.last_name} onChangeText={set('last_name')} textContentType="familyName" />
      <Input label="Phone" value={f.phone} onChangeText={set('phone')} keyboardType="phone-pad" textContentType="telephoneNumber" />
      {user.is_seller ? <Input label="Store name" value={f.company} onChangeText={set('company')} /> : null}
      <Muted style={{ marginBottom: space.md }}>Email: {user.email}</Muted>
      <Button title="Save changes" loading={busy} onPress={save} />
    </Screen>
  );
}
