import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { colors, space } from '@/lib/theme';

/** Covers the app until Face ID / fingerprint succeeds (only when the user turned on app lock). */
export function LockScreen() {
  const { unlock, signOut } = useAuth();
  useEffect(() => {
    void unlock();
  }, [unlock]);
  return (
    <View style={s.wrap}>
      <Image source={require('../../assets/images/splash-logo.png')} style={{ width: 180, height: 80 }} contentFit="contain" />
      <Text style={s.title}>ChiegoTrading is locked</Text>
      <Text style={s.sub}>Use Face ID, fingerprint or your device passcode to continue.</Text>
      <Button title="Unlock" icon="finger-print" variant="lime" onPress={() => void unlock()} style={{ alignSelf: 'stretch' }} />
      <Button title="Sign out instead" variant="ghost" onPress={() => void signOut()} />
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFill, zIndex: 100, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.md },
  title: { color: '#fff', fontSize: 22, fontWeight: '600', marginTop: space.lg },
  sub: { color: '#dbe9d8', textAlign: 'center', marginBottom: space.lg },
});
