import { useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Badge, Button, Card, ErrorState, H2, Loading, Muted, Row, Screen } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { runPayment } from '@/lib/payment';
import { useMeta, useOrder } from '@/lib/queries';
import { colors, space } from '@/lib/theme';
import { dateLabel, email, priceLabel, shareText, statusColor, success, whatsapp } from '@/lib/utils';

export default function OrderScreen() {
  const { reference } = useLocalSearchParams<{ reference: string }>();
  const qc = useQueryClient();
  const { data: o, isLoading, isError, error, refetch, isRefetching } = useOrder(reference);
  const { data: meta } = useMeta();
  const [busy, setBusy] = useState(false);

  if (isLoading) return <Loading />;
  if (isError || !o) return <ErrorState message={(error as Error)?.message ?? 'Order not found.'} onRetry={refetch} />;
  const c = statusColor(o.status);

  const cancel = () =>
    Alert.alert('Cancel this order?', 'This cannot be undone.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: async () => {
          try {
            await api(`/orders/${reference}/cancel/`, { method: 'POST' });
            qc.invalidateQueries({ queryKey: ['orders'] });
            refetch();
          } catch (e) {
            Alert.alert('Could not cancel', e instanceof ApiError ? e.message : 'Try again.');
          }
        },
      },
    ]);

  return (
    <Screen refreshing={isRefetching} onRefresh={refetch}>
      <Card style={{ gap: 8, marginBottom: space.lg }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable
            accessibilityLabel="Copy order reference"
            onPress={async () => {
              await Clipboard.setStringAsync(o.reference);
              success();
            }}>
            <Row style={{ gap: 6 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.greenDark }}>{o.reference}</Text>
              <Ionicons name="copy-outline" size={16} color={colors.muted} />
            </Row>
          </Pressable>
          <Badge label={o.status_label} bg={c.bg} fg={c.fg} />
        </Row>
        <Muted>Placed {dateLabel(o.created)}{o.paid_at ? ` · Paid ${dateLabel(o.paid_at)}` : ''}</Muted>
        {o.can_pay ? <Button title="Pay now" icon="card" loading={busy} onPress={async () => { setBusy(true); await runPayment(o.reference, qc); setBusy(false); }} /> : null}
        {o.pay_method === 'invoice' && o.status === 'awaiting_payment' ? <Muted>We emailed you an invoice with bank details. Payment is confirmed by our team.</Muted> : null}
      </Card>

      <H2>Items</H2>
      <Card style={{ marginVertical: space.sm, gap: space.sm }}>
        {o.items.map((i, n) => (
          <Row key={n} style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text style={{ flex: 1, color: colors.text }}>{i.name}{'\n'}<Text style={{ color: colors.muted, fontSize: 13 }}>{i.quantity} {i.unit} × {priceLabel(i.price).main}</Text></Text>
            <Text style={{ fontWeight: '600' }}>{priceLabel(i.line_total).main}</Text>
          </Row>
        ))}
        <Row style={{ justifyContent: 'space-between' }}><Muted>Subtotal</Muted><Text>{priceLabel(o.subtotal).main}</Text></Row>
        <Row style={{ justifyContent: 'space-between' }}><Muted>Service fee</Muted><Text>{priceLabel(o.fee).main}</Text></Row>
        <Row style={{ justifyContent: 'space-between' }}><Text style={{ fontWeight: '700' }}>Total</Text><Text style={{ fontWeight: '700', color: colors.green, fontSize: 18 }}>{priceLabel(o.total).main}</Text></Row>
      </Card>

      <H2>Delivery</H2>
      <Card style={{ marginVertical: space.sm, gap: 2 }}>
        <Text style={{ color: colors.text }}>{o.name}</Text>
        <Muted>{o.phone} · {o.email}</Muted>
        <Muted>{o.ship_method === 'pickup' ? 'Pickup from our Warri office' : `${o.address}${o.state ? ', ' + o.state : ''}`}</Muted>
      </Card>

      <Row style={{ gap: space.md, marginTop: space.md }}>
        <Button style={{ flex: 1 }} variant="secondary" icon="logo-whatsapp" title="Help" onPress={() => meta && whatsapp(meta.site.phone, `Hello, about order ${o.reference}`)} />
        <Button style={{ flex: 1 }} variant="secondary" icon="share-outline" title="Share" onPress={() => shareText(`ChiegoTrading order ${o.reference}`)} />
      </Row>
      {meta ? <Button title="Email us" variant="ghost" onPress={() => email(meta.site.email, `Order ${o.reference}`)} /> : null}
      {o.can_cancel ? <Button title="Cancel order" variant="danger" onPress={cancel} style={{ marginTop: space.md }} /> : null}
    </Screen>
  );
}
