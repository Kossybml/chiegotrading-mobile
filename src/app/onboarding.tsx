import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { KEYS, store } from '@/lib/storage';
import { colors, space } from '@/lib/theme';
import type { IconName } from '@/components/ui';

const slides: { icon: IconName; title: string; text: string }[] = [
  { icon: 'water-outline', title: 'Natural, from Warri', text: 'Spring water, juices, herbal drinks and farm produce, straight from the source.' },
  { icon: 'globe-outline', title: 'Prices in your currency', text: 'Browse in naira, dollars, pounds, euros and more. You always see the exact naira charge.' },
  { icon: 'shield-checkmark-outline', title: 'Order with confidence', text: 'Pay securely online, track every order, and buy from verified sellers.' },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const list = useRef<FlatList>(null);

  async function finish() {
    await store.set(KEYS.onboarded, true);
    router.replace('/(tabs)');
  }

  return (
    <View style={[s.wrap, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl }]}>
      <Image source={require('../../assets/images/splash-logo.png')} style={{ width: 150, height: 66, alignSelf: 'center' }} contentFit="contain" />
      <FlatList
        ref={list}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(x) => x.title}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, padding: space.xxl, alignItems: 'center', justifyContent: 'center' }}>
            <View style={s.iconWrap}>
              <Ionicons name={item.icon} size={64} color={colors.lime} />
            </View>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.text}>{item.text}</Text>
          </View>
        )}
      />
      <View style={s.dots}>{slides.map((_, k) => <View key={k} style={[s.dot, k === i && s.dotOn]} />)}</View>
      <View style={{ paddingHorizontal: space.xl, gap: space.sm }}>
        {i < slides.length - 1 ? (
          <Button title="Next" variant="lime" onPress={() => list.current?.scrollToIndex({ index: i + 1 })} />
        ) : (
          <Button title="Start shopping" variant="lime" onPress={finish} />
        )}
        <Button title="Skip" variant="ghost" onPress={finish} style={{ minHeight: 40 }} />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.green },
  iconWrap: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: space.xxl },
  title: { color: '#fff', fontSize: 28, fontWeight: '600', textAlign: 'center', letterSpacing: -0.5 },
  text: { color: '#dbe9d8', fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: space.md, maxWidth: 320 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: space.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotOn: { width: 24, backgroundColor: colors.lime },
});
