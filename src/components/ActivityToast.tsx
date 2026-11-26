import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProductImage } from '@/components/ProductCard';
import { colors, radius, shadow, space } from '@/lib/theme';
import type { ActivityItem } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

/** "Chidi from Lagos bought ..." card built from real paid orders (the server hides it until there are enough). */
export function ActivityToast({ items, paused }: { items: ActivityItem[]; paused?: boolean }) {
  const [current, setCurrent] = useState<ActivityItem | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const slide = useRef(new Animated.Value(0)).current;
  const idx = useRef(0);

  useEffect(() => {
    if (!items.length || dismissed || paused) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const show = () => {
      if (!alive) return;
      setCurrent(items[idx.current++ % items.length]);
      Animated.timing(slide, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
      timer = setTimeout(() => {
        Animated.timing(slide, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          if (!alive) return;
          setCurrent(null);
          if (idx.current < 6) timer = setTimeout(show, 14_000 + Math.random() * 8_000);
        });
      }, 6_500);
    };
    timer = setTimeout(show, 8_000);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [items, dismissed, paused, slide]);

  if (!current) return null;
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[s.wrap, { opacity: slide, transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
      <Pressable
        style={s.card}
        onPress={() => current.slug && router.push({ pathname: '/product/[slug]', params: { slug: current.slug } })}>
        <ProductImage uri={current.image} size={52} style={{ borderRadius: 12 }} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={s.who}>{current.name}{current.place ? ` from ${current.place}` : ''} bought</Text>
          <Text numberOfLines={1} style={s.prod}>{current.product}</Text>
          <Text style={s.meta}>{timeAgo(current.ts)} · <Text style={{ color: colors.green, fontWeight: '600' }}>Verified order</Text></Text>
        </View>
        <Pressable accessibilityLabel="Close" hitSlop={12} onPress={() => setDismissed(true)}>
          <Ionicons name="close" size={16} color={colors.muted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}
const s = StyleSheet.create({
  wrap: { position: 'absolute', left: space.lg, right: space.lg, bottom: space.lg },
  card: { flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: '#fff', borderRadius: radius.lg, padding: space.sm, paddingRight: space.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, ...shadow, shadowOpacity: 0.2 },
  who: { fontSize: 12, color: colors.muted },
  prod: { fontSize: 14, fontWeight: '600', color: colors.greenDark },
  meta: { fontSize: 11, color: colors.muted, marginTop: 1 },
});
