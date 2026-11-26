import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnline } from '@/hooks/useNetwork';
import { colors } from '@/lib/theme';

export function OfflineBanner() {
  const online = useOnline();
  const insets = useSafeAreaInsets();
  if (online) return null;
  return (
    <View style={[s.bar, { paddingTop: insets.top + 6 }]} accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
      <Text style={s.text}>You're offline. Showing saved items where possible.</Text>
    </View>
  );
}
const s = StyleSheet.create({
  bar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: colors.warn, paddingBottom: 6, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
