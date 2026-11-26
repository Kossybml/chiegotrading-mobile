import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { KEYS, store } from '@/lib/storage';
import { colors, space } from '@/lib/theme';

const slides = [
  { image: require('../../assets/images/onb-1.jpg'), title: 'Natural, from Warri', text: 'Spring water, juices, herbal drinks and farm produce, straight from the source.' },
  { image: require('../../assets/images/onb-2.jpg'), title: 'Bulk and export, made simple', text: 'Order by the carton or the container. Browse in naira, dollars, pounds or euros.' },
  { image: require('../../assets/images/onb-3.jpg'), title: 'Order with confidence', text: 'Pay securely online, track every order and buy from verified sellers.' },
];

/** Dark fade at the bottom made of stacked bands, so no native gradient module is needed. */
function Fade() {
  const n = 24;
  return (
    <View pointerEvents="none" style={s.fade}>
      {Array.from({ length: n }, (_, k) => (
        <View key={k} style={{ flex: 1, backgroundColor: `rgba(0,0,0,${Math.min(1, Math.pow((k + 1) / n, 1.6) * 1.05).toFixed(3)})` }} />
      ))}
    </View>
  );
}

export default function Onboarding() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const list = useRef<FlatList>(null);

  async function finish() {
    await store.set(KEYS.onboarded, true);
    router.replace('/(tabs)');
  }
  const last = i === slides.length - 1;

  return (
    <View style={s.wrap}>
      <StatusBar style="light" />
      <FlatList
        ref={list}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(x) => x.title}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => <Image source={item.image} style={{ width, height }} contentFit="cover" />}
      />
      <Fade />
      <View style={[s.panel, { paddingBottom: insets.bottom + space.xl }]} pointerEvents="box-none">
        <View style={s.dots}>{slides.map((_, k) => <View key={k} style={[s.dot, k === i && s.dotOn]} />)}</View>
        <Text style={s.title}>{slides[i].title}</Text>
        <Text style={s.text}>{slides[i].text}</Text>
        <Button title={last ? 'Start shopping' : 'Next'} variant="lime" onPress={() => (last ? finish() : list.current?.scrollToIndex({ index: i + 1 }))} />
        {!last ? <Button title="Skip" variant="ghost" onPress={finish} style={{ minHeight: 40 }} /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60%' },
  panel: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.xl, gap: space.sm },
  dots: { flexDirection: 'row', gap: 6, marginBottom: space.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotOn: { width: 24, backgroundColor: colors.red },
  title: { color: '#fff', fontSize: 34, fontWeight: '600', letterSpacing: -0.8, lineHeight: 40 },
  text: { color: 'rgba(255,255,255,0.8)', fontSize: 16, lineHeight: 24, marginBottom: space.md },
});
