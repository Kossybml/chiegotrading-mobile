import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Switch, Text } from 'react-native';

import { Button, Card, H2, Input, ListItem, Muted, Screen } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { colors, space } from '@/lib/theme';
import { failure, success } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

export default function Security() {
  const { user, biometricAvailable, biometricEnabled, setBiometric, signOut } = useAuth();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [del, setDel] = useState('');
  if (!user) return null;

  async function changePassword() {
    setBusy(true);
    setError('');
    try {
      await api('/me/password/', { method: 'POST', body: { current_password: cur, new_password: next } });
      success();
      setCur('');
      setNext('');
      Alert.alert('Password updated');
    } catch (e) {
      failure();
      setError(e instanceof ApiError ? (e.fields ? Object.values(e.fields)[0][0] : e.message) : 'Try again.');
    } finally {
      setBusy(false);
    }
  }

  function deleteAccount() {
    Alert.alert('Delete your account?', 'This is permanent. Past orders are kept for our records without your details.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete forever',
        style: 'destructive',
        onPress: async () => {
          try {
            await api('/me/', { method: 'DELETE', body: user!.has_password ? { password: del } : { confirm_email: del } });
            await signOut();
            router.replace('/(tabs)');
          } catch (e) {
            failure();
            Alert.alert('Could not delete', e instanceof ApiError ? e.message : 'Try again.');
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      {biometricAvailable ? (
        <Card style={{ marginBottom: space.lg, padding: 0 }}>
          <ListItem
            icon="finger-print"
            title="App lock"
            subtitle="Ask for Face ID / fingerprint when you reopen the app"
            right={<Switch value={biometricEnabled} trackColor={{ true: colors.green }} onValueChange={(v) => void setBiometric(v)} />}
          />
        </Card>
      ) : null}

      <H2>{user.has_password ? 'Change password' : 'Set a password'}</H2>
      <Card style={{ marginVertical: space.sm }}>
        {user.has_password ? <Input label="Current password" value={cur} onChangeText={setCur} secureTextEntry textContentType="password" /> : null}
        <Input label="New password" value={next} onChangeText={setNext} secureTextEntry textContentType="newPassword" />
        {error ? <Text style={{ color: colors.danger, marginBottom: space.sm }}>{error}</Text> : null}
        <Button title="Update password" loading={busy} disabled={!next} onPress={changePassword} />
      </Card>

      <H2>Delete account</H2>
      <Card style={{ marginVertical: space.sm }}>
        <Muted style={{ marginBottom: space.md }}>{user.has_password ? 'Enter your password to confirm.' : `Type your email (${user.email}) to confirm.`}</Muted>
        <Input value={del} onChangeText={setDel} secureTextEntry={user.has_password} autoCapitalize="none" placeholder={user.has_password ? 'Password' : 'Email'} />
        <Button title="Delete my account" variant="danger" disabled={!del} onPress={deleteAccount} />
      </Card>
    </Screen>
  );
}
