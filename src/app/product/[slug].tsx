import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { ProductCard, ProductImage } from '@/components/ProductCard';
import { Badge, Body, Button, Card, ErrorState, H1, Loading, Muted, Row, Screen, SectionHeader, Stars, Stepper } from '@/components/ui';
import { useProduct, useRelated, useReviews } from '@/lib/queries';
import { colors, space } from '@/lib/theme';
import { priceLabel, shareText, timeAgo } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';
import { FlatList } from 'react-native';
import { config } from '@/lib/config';

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width } = useWindowDimensions();
  const { data: p, isLoading, isError, error, refetch, isRefetching } = useProduct(slug);
  const related = useRelated(slug);
  const reviews = useReviews(slug);
  const cart = useCart();
  const [qty, setQty] = useState<number | null>(null);

  if (isLoading) return <Loading />;
  if (isError || !p) return <ErrorState message={(error as Error)?.message ?? 'This product is not available.'} onRetry={refetch} />;

  const q = qty ?? p.moq;
  const price = priceLabel(p.price);
  const site = config.apiUrl.replace(/\/api\/v1$/, '');
  const inCart = cart.lines.find((l) => l.id === p.id)?.quantity ?? 0;

  return (
    <Screen
      padded={false}
      refreshing={isRefetching}
      onRefresh={refetch}
      footer={
        <Row style={{ gap: space.md }}>
          <Stepper value={q} min={p.moq} onChange={setQty} />
          <Button
            style={{ flex: 1 }}
            icon="cart"
            title={inCart ? `Add more (${inCart} in cart)` : 'Add to cart'}
            onPress={() => {
              cart.add(p, q);
              setQty(null);
            }}
          />
        </Row>
      }>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable accessibilityLabel="Share this product" hitSlop={10} onPress={() => shareText(`${p.name} on ChiegoTrading`, `${site}/shop/${p.slug}/`)}>
              <Ionicons name="share-outline" size={24} color={colors.greenDark} />
            </Pressable>
          ),
        }}
      />
      {p.images.large ? <Image source={{ uri: p.images.large }} style={{ width, height: width }} contentFit="cover" transition={200} /> : <ProductImage uri="" size={width} />}
      <View style={{ padding: space.lg, gap: space.md }}>
        <Row style={{ gap: 6, flexWrap: 'wrap' }}>
          {p.category ? <Badge label={p.category.name} bg="#eef0e8" fg={colors.text} /> : null}
          {p.export_ready ? <Badge label="Export-ready" icon="airplane" bg={colors.lime} fg={colors.greenDark} /> : null}
          {p.seller.verified ? <Badge label="Verified seller" icon="shield-checkmark" /> : null}
        </Row>
        <H1>{p.name}</H1>
        {p.grade ? <Muted>{p.grade}</Muted> : null}
        <Pressable onPress={() => router.push({ pathname: '/reviews/[slug]', params: { slug: p.slug } })}>
          <Row style={{ gap: 6 }}>
            <Stars value={p.rating.average} />
            <Muted>{p.rating.count ? `${p.rating.average} · ${p.rating.count} review${p.rating.count === 1 ? '' : 's'}` : 'No reviews yet'}</Muted>
          </Row>
        </Pressable>
        <View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.green }}>
            {price.main}
            <Text style={{ fontSize: 14, fontWeight: '400', color: colors.muted }}> / {p.unit}</Text>
          </Text>
          {price.sub ? <Muted>Charged as {price.sub}</Muted> : null}
          <Muted>Minimum order: {p.moq} {p.unit}{p.stock_note ? ` · ${p.stock_note}` : ''}</Muted>
        </View>

        {p.description ? <Body>{p.description}</Body> : null}

        {p.specs.length ? (
          <Card style={{ padding: 0 }}>
            {[...p.specs, ...(p.origin ? [{ label: 'Origin', value: p.origin }] : [])].map((sp, i, arr) => (
              <Row key={sp.label} style={{ justifyContent: 'space-between', padding: space.md, paddingHorizontal: space.lg, borderBottomWidth: i < arr.length - 1 ? 0.5 : 0, borderBottomColor: colors.border }}>
                <Muted>{sp.label}</Muted>
                <Text style={{ color: colors.text, fontWeight: '500', flexShrink: 1, textAlign: 'right' }}>{sp.value}</Text>
              </Row>
            ))}
          </Card>
        ) : null}

        <Row style={{ gap: 6 }}>
          <Ionicons name={p.seller.official ? 'ribbon-outline' : 'storefront-outline'} size={16} color={colors.muted} />
          <Muted>Sold by {p.seller.name}</Muted>
        </Row>

        <SectionHeader title="Reviews" action="See all" onAction={() => router.push({ pathname: '/reviews/[slug]', params: { slug: p.slug } })} />
        {reviews.data?.results.length ? (
          reviews.data.results.slice(0, 2).map((r) => (
            <Card key={r.id} style={{ gap: 4 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Stars value={r.rating} size={13} />
                <Muted>{timeAgo(r.created)}</Muted>
              </Row>
              {r.title ? <Text style={{ fontWeight: '600', color: colors.greenDark }}>{r.title}</Text> : null}
              <Body style={{ fontSize: 14 }}>{r.body}</Body>
              <Muted>{r.author}{r.verified_purchase ? ' · Verified purchase' : ''}</Muted>
            </Card>
          ))
        ) : (
          <Muted>Be the first to review this product.</Muted>
        )}

        {related.data?.length ? (
          <>
            <SectionHeader title="You may also like" />
            <FlatList horizontal data={related.data} keyExtractor={(x) => String(x.id)} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md }} renderItem={({ item }) => <ProductCard product={item} width={170} />} />
          </>
        ) : null}
      </View>
    </Screen>
  );
}
