import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { Badge, Card, EmptyState, Loading, Muted, Row, Screen } from '@/components/ui';
import { useOrders } from '@/lib/queries';
import { space } from '@/lib/theme';
import { dateLabel, priceLabel, statusColor } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { colors } from '@/lib/theme';

export default function Orders() {
  const { user } = useAuth();
  const q = useOrders(!!user);
  if (!user) return <EmptyState icon="receipt-outline" title="Log in to see your orders" text="Track payments and deliveries in one place." action="Log in" onAction={() => router.push('/login')} />;
  if (q.isLoading) return <Loading />;
  if (!q.data?.results.length) return <EmptyState icon="receipt-outline" title="No orders yet" text="Orders you place will appear here." action="Start shopping" onAction={() => router.navigate('/(tabs)/shop')} />;
  return (
    <Screen refreshing={q.isRefetching} onRefresh={q.refetch}>
      {q.data.results.map((o) => {
        const c = statusColor(o.status);
        return (
          <Pressable key={o.reference} onPress={() => router.push({ pathname: '/order/[reference]', params: { reference: o.reference } })}>
            <Card style={{ marginBottom: space.md, gap: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700', color: colors.greenDark }}>{o.reference}</Text>
                <Badge label={o.status_label} bg={c.bg} fg={c.fg} />
              </Row>
              <Muted>{dateLabel(o.created)} · {o.item_count} item{o.item_count === 1 ? '' : 's'}</Muted>
              <Text style={{ fontWeight: '700', color: colors.green }}>{priceLabel(o.total).main}</Text>
              {o.can_pay ? <Text style={{ color: colors.red, fontWeight: '600' }}>Payment needed</Text> : null}
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
}
