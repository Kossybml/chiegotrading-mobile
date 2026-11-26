import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Row, Stars } from '@/components/ui';
import { colors, radius, shadow, space } from '@/lib/theme';
import type { Product } from '@/lib/types';
import { priceLabel } from '@/lib/utils';

export function ProductImage({ uri, size, style }: { uri: string; size?: number; style?: any }) {
  return uri ? (
    <Image source={{ uri }} style={[{ width: size, height: size }, style]} contentFit="cover" transition={150} />
  ) : (
    <View style={[{ width: size, height: size, backgroundColor: '#e3f3dd', alignItems: 'center', justifyContent: 'center' }, style]}>
      <Ionicons name="leaf-outline" size={(size ?? 80) * 0.35} color={colors.green} />
    </View>
  );
}

export function ProductCard({ product, width }: { product: Product; width?: number }) {
  const p = priceLabel(product.price);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${p.main}`}
      onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: product.slug } })}
      style={({ pressed }) => [s.card, width ? { width } : { flex: 1 }, pressed && { opacity: 0.9 }]}>
      <ProductImage uri={product.images.medium} style={s.img} />
      <View style={s.badges}>
        {product.export_ready ? <Badge label="Export" bg={colors.lime} fg={colors.greenDark} icon="airplane" /> : null}
      </View>
      <View style={{ padding: space.md, gap: 3 }}>
        <Text numberOfLines={2} style={s.name}>{product.name}</Text>
        {product.grade ? <Text numberOfLines={1} style={s.meta}>{product.grade}</Text> : null}
        <Row style={{ gap: 4 }}>
          <Stars value={product.rating.average} size={12} />
          {product.rating.count ? <Text style={s.meta}>({product.rating.count})</Text> : null}
        </Row>
        <Text style={s.price}>{p.main}<Text style={s.unit}> / {product.unit}</Text></Text>
        {p.sub ? <Text style={s.meta}>{p.sub}</Text> : null}
        {!product.seller.official ? (
          <Row style={{ gap: 4 }}>
            {product.seller.verified ? <Ionicons name="shield-checkmark" size={12} color={colors.green} /> : null}
            <Text numberOfLines={1} style={s.meta}>{product.seller.name}</Text>
          </Row>
        ) : null}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: radius.md, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, ...shadow },
  img: { width: '100%', aspectRatio: 1 },
  badges: { position: 'absolute', top: 8, left: 8 },
  name: { fontSize: 14, fontWeight: '600', color: colors.greenDark },
  meta: { fontSize: 12, color: colors.muted },
  price: { fontSize: 15, fontWeight: '700', color: colors.green, marginTop: 2 },
  unit: { fontSize: 12, fontWeight: '400', color: colors.muted },
});
