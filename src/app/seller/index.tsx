import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Badge, Button, Card, EmptyState, Loading, Muted, Row, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { useListings } from '@/lib/queries';
import { colors, space } from '@/lib/theme';
import type { User } from '@/lib/types';
import { naira } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

const tone = { live: { bg: '#e3f3dd', fg: colors.green }, pending: { bg: '#fff3d6', fg: '#8a6100' }, hidden: { bg: '#eceee6', fg: colors.muted } } as const;

export default function Seller() {
  const { user, setUser } = useAuth();
  const qc = useQueryClient();
  const q = useListings();
  if (!user) return <EmptyState icon="storefront-outline" title="Log in to sell" action="Log in" onAction={() => router.push('/login')} />;
  if (!user.is_seller) {
    return (
      <EmptyState
        icon="storefront-outline"
        title="Sell on ChiegoTrading"
        text="Switch your account to seller to list your products. Every listing is reviewed by our team before it goes live."
        action="Become a seller"
        onAction={async () => { setUser(await api<User>('/me/', { method: 'PATCH', body: { role: 'seller' } })); qc.invalidateQueries({ queryKey: ['seller'] }); }}
      />
    );
  }
  return (
    <Screen refreshing={q.isRefetching} onRefresh={q.refetch}>
      <Row style={{ gap: space.md, marginBottom: space.lg }}>
        <Button style={{ flex: 1 }} icon="add" title="New listing" onPress={() => router.push('/seller/listing')} />
        <Button style={{ flex: 1 }} variant="secondary" icon="cash-outline" title="Sales" onPress={() => router.push('/seller/sales')} />
      </Row>
      {q.isLoading ? <Loading /> : !q.data?.results.length ? <Muted>No listings yet. Add your first product.</Muted> : null}
      {q.data?.results.map((l) => (
        <Pressable key={l.id} onPress={() => router.push({ pathname: '/seller/listing', params: { id: String(l.id) } })}>
          <Card style={{ marginBottom: space.md, flexDirection: 'row', gap: space.md }}>
            {l.images.thumb ? <Image source={{ uri: l.images.thumb }} style={{ width: 64, height: 64, borderRadius: 10 }} /> : <View style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: colors.border }} />}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontWeight: '600', color: colors.greenDark }} numberOfLines={1}>{l.name}</Text>
              <Muted>{naira(l.price)} / {l.unit}</Muted>
              <Row><Badge label={l.status_label} bg={tone[l.status].bg} fg={tone[l.status].fg} /></Row>
            </View>
          </Card>
        </Pressable>
      ))}
      {user.verified_seller ? null : <Muted style={{ marginTop: space.md }}>Tip: verified sellers get a badge on their products.</Muted>}
    </Screen>
  );
}
