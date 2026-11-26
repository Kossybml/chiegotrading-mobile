import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, space } from '@/lib/theme';

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.green }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[s.head, { paddingTop: insets.top + space.xl }]}>
          <Image source={require('../../assets/images/splash-logo.png')} style={{ width: 150, height: 66 }} contentFit="contain" />
        </View>
        <View style={[s.sheet, { paddingBottom: insets.bottom + space.xl }]}>
          <Text style={s.title}>{title}</Text>
          {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  head: { alignItems: 'center', paddingBottom: space.xl },
  sheet: { flex: 1, backgroundColor: colors.bg, borderTopLeftRadius: radius.lg + 8, borderTopRightRadius: radius.lg + 8, padding: space.xl },
  title: { fontSize: 26, fontWeight: '600', color: colors.greenDark, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: colors.muted, marginTop: 6, marginBottom: space.xl, lineHeight: 20 },
});
