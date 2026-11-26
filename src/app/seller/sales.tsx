import { Text } from 'react-native';

import { Badge, Card, EmptyState, Loading, Muted, Row, Screen } from '@/components/ui';
import { useSales } from '@/lib/queries';
import { colors, space } from '@/lib/theme';
import { dateLabel, priceLabel, statusColor } from '@/lib/utils';

export default function Sales() {
  const q = useSales();
  if (q.isLoading) return <Loading />;
  if (!q.data?.results.length) return <EmptyState icon="cash-outline" title="No sales yet" text="Orders for your products will show up here." />;
  return (
    <Screen refreshing={q.isRefetching} onRefresh={q.refetch}>
      {q.data.results.map((s, i) => {
        const c = statusColor(s.order_status);
        return (
          <Card key={i} style={{ marginBottom: space.md, gap: 4 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '600', color: colors.greenDark, flex: 1 }} numberOfLines={1}>{s.name}</Text>
              <Badge label={s.order_status.replace('_', ' ')} bg={c.bg} fg={c.fg} />
            </Row>
            <Muted>{s.quantity} {s.unit} · {s.order_reference} · {dateLabel(s.placed)}</Muted>
            <Text style={{ fontWeight: '700', color: colors.green }}>{priceLabel(s.line_total).main}</Text>
          </Card>
        );
      })}
    </Screen>
  );
}
