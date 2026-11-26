import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';

import { ProductImage } from '@/components/ProductCard';
import { Button, Card, EmptyState, Muted, Row, Screen, Stepper } from '@/components/ui';
import { api } from '@/lib/api';
import { colors, space } from '@/lib/theme';
import type { Quote } from '@/lib/types';
import { priceLabel } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';
import { useCurrency } from '@/providers/CurrencyProvider';
import { CurrencyPill } from '@/components/sheets';

export default function Cart() {
  const cart = useCart();
  const { currency } = useCurrency();
  const items = cart.lines.map((l) => ({ product: l.id, quantity: l.quantity }));
  const quote = useQuery({
    queryKey: ['quote', JSON.stringify(items), currency],
    enabled: items.length > 0,
    queryFn: () => api<Quote>('/orders/quote/', { method: 'POST', body: { items }, auth: false }),
    retry: false,
  });

  if (cart.ready && !cart.lines.length) {
    return <EmptyState icon="cart-outline" title="Your cart is empty" text="Add products from the shop and they will show up here." action="Browse the shop" onAction={() => router.navigate('/(tabs)/shop')} />;
  }
  const price = (id: number) => quote.data?.lines.find((l) => l.product === id);

  return (
    <Screen
      footer={
        <View style={{ gap: space.sm }}>
          {quote.data ? (
            <>
              <Row style={{ justifyContent: 'space-between' }}><Muted>Subtotal</Muted><Text>{priceLabel(quote.data.subtotal).main}</Text></Row>
              <Row style={{ justifyContent: 'space-between' }}><Muted>Service fee (card only)</Muted><Text>{priceLabel(quote.data.fee).main}</Text></Row>
            </>
          ) : null}
          <Button title="Checkout" icon="lock-closed" disabled={!quote.data} loading={quote.isLoading} onPress={() => router.push('/checkout')} />
        </View>
      }>
      <Row style={{ justifyContent: 'flex-end', marginBottom: space.md }}><CurrencyPill /></Row>
      {quote.isError ? <Text style={{ color: colors.danger, marginBottom: space.md }}>{(quote.error as Error).message}</Text> : null}
      {cart.lines.map((l) => {
        const q = price(l.id);
        return (
          <Card key={l.id} style={{ marginBottom: space.md, flexDirection: 'row', gap: space.md }}>
            <Pressable onPress={() => router.push({ pathname: '/product/[slug]', params: { slug: l.slug } })}>
              <ProductImage uri={l.image} size={76} />
            </Pressable>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontWeight: '600', color: colors.greenDark }} numberOfLines={2}>{l.name}</Text>
              <Muted>{q ? `${priceLabel(q.price).main} / ${l.unit}` : `Min ${l.moq} ${l.unit}`}</Muted>
              <Row style={{ justifyContent: 'space-between' }}>
                <Stepper value={l.quantity} min={l.moq} onChange={(n) => cart.setQuantity(l.id, n)} />
                <Pressable
                  accessibilityLabel={`Remove ${l.name}`}
                  hitSlop={10}
                  onPress={() => Alert.alert('Remove item?', l.name, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => cart.remove(l.id) }])}>
                  <Text style={{ color: colors.danger }}>Remove</Text>
                </Pressable>
              </Row>
              {q ? <Text style={{ fontWeight: '700', color: colors.green }}>{priceLabel(q.line_total).main}</Text> : null}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
