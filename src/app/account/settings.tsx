import { useEffect, useState } from 'react';
import { Alert, Linking, Switch } from 'react-native';
import * as Application from 'expo-application';

import { CurrencySheet } from '@/components/sheets';
import { Card, ListItem, Muted, Screen } from '@/components/ui';
import { pushPermissionStatus, registerPush, unregisterPush } from '@/lib/push';
import { colors, space } from '@/lib/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useCurrency } from '@/providers/CurrencyProvider';

export default function Settings() {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [push, setPush] = useState(false);
  useEffect(() => { pushPermissionStatus().then((s) => setPush(s === 'granted')); }, []);

  async function togglePush(on: boolean) {
    if (!on) {
      await unregisterPush();
      setPush(false);
      return;
    }
    const token = await registerPush().catch(() => null);
    setPush(!!token);
    if (!token) Alert.alert('Notifications are off', 'Allow notifications for ChiegoTrading in your phone settings.', [{ text: 'Not now', style: 'cancel' }, { text: 'Open settings', onPress: () => Linking.openSettings() }]);
  }

  return (
    <Screen>
      <Card style={{ padding: 0, marginBottom: space.lg }}>
        <ListItem icon="globe-outline" title="Display currency" subtitle={`${currency} · payment is always in naira`} onPress={() => setOpen(true)} />
        {user ? <ListItem icon="notifications-outline" title="Order notifications" right={<Switch value={push} trackColor={{ true: colors.green }} onValueChange={togglePush} />} /> : null}
        <ListItem icon="settings-outline" title="Phone settings" subtitle="Permissions for camera, photos, notifications" onPress={() => Linking.openSettings()} />
      </Card>
      <Muted style={{ textAlign: 'center' }}>Version {Application.nativeApplicationVersion ?? '1.0.0'} ({Application.nativeBuildVersion ?? '1'})</Muted>
      <CurrencySheet visible={open} onClose={() => setOpen(false)} />
    </Screen>
  );
}
