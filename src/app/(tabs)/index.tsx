import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActivityToast } from '@/components/ActivityToast';
import { ProductCard } from '@/components/ProductCard';
import { CurrencyPill } from '@/components/sheets';
import { Body, Button, Card, Chip, ErrorState, Input, Loading, Muted, Row, SectionHeader } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useHome } from '@/lib/queries';
import { colors, radius, space } from '@/lib/theme';
import { failure, success } from '@/lib/utils';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, error, refetch, isRefetching } = useHome();

  if (isLoading) return <Loading />;
  if (isError || !data) return <ErrorState message={(error as Error)?.message ?? 'Please try again.'} onRetry={refetch} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} tintColor="#fff" colors={[colors.green]} />}
        showsVerticalScrollIndicator={false}>
        <View style={[s.hero, { paddingTop: insets.top + space.md }]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Image source={require('../../../assets/images/splash-logo.png')} style={{ width: 110, height: 48 }} contentFit="contain" />
            <CurrencyPill light />
          </Row>
          <Text style={s.heroTitle}>Natural goods,{'\n'}delivered fresh.</Text>
          <Pressable style={s.search} onPress={() => router.push('/(tabs)/shop')} accessibilityRole="search" accessibilityLabel="Search products">
            <Ionicons name="search" size={18} color={colors.muted} />
            <Text style={{ color: colors.muted, fontSize: 15 }}>Search water, juice, ginger…</Text>
          </Pressable>
        </View>

        <View style={{ padding: space.lg }}>
          <Row style={{ gap: space.sm, flexWrap: 'wrap' }}>
            {data.categories.map((c) => (
              <Chip key={c.slug} label={c.name} onPress={() => router.push({ pathname: '/(tabs)/shop', params: { category: c.slug } })} />
            ))}
          </Row>

          <SectionHeader title="New arrivals" action="See all" onAction={() => router.push('/(tabs)/shop')} />
          <FlatList
            horizontal
            data={data.new_arrivals}
            keyExtractor={(p) => String(p.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: space.md, paddingRight: space.lg }}
            style={{ marginHorizontal: -space.lg, paddingLeft: space.lg }}
            renderItem={({ item }) => <ProductCard product={item} width={176} />}
          />

          {data.top_rated.length ? (
            <>
              <SectionHeader title="Top rated" />
              <FlatList
                horizontal
                data={data.top_rated}
                keyExtractor={(p) => String(p.id)}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: space.md, paddingRight: space.lg }}
                style={{ marginHorizontal: -space.lg, paddingLeft: space.lg }}
                renderItem={({ item }) => <ProductCard product={item} width={176} />}
              />
            </>
          ) : null}

          <Card style={{ marginTop: space.xl, backgroundColor: colors.greenDark }}>
            <Row style={{ gap: space.md }}>
              <Ionicons name="airplane" size={28} color={colors.lime} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Bulk or export order?</Text>
                <Text style={{ color: '#c9dcc5', fontSize: 13, marginTop: 2 }}>Tell us what you need and we'll quote you.</Text>
              </View>
            </Row>
            <Button title="Talk to us" variant="lime" onPress={() => router.push('/contact')} style={{ marginTop: space.md }} />
          </Card>

          <Newsletter />
        </View>
      </ScrollView>
      <ActivityToast items={data.activity} />
    </View>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setMsg(null);
    setBusy(true);
    try {
      const r = await api<{ message: string }>('/newsletter/', { method: 'POST', auth: false, body: { email: email.trim(), consent: agree } });
      success();
      setMsg({ text: r.message, ok: true });
      setEmail('');
    } catch (e) {
      failure();
      setMsg({ text: e instanceof ApiError ? (e.fields?.consent?.[0] ?? e.fields?.email?.[0] ?? e.message) : 'Please try again.', ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card style={{ marginTop: space.xl }}>
      <Text style={{ fontSize: 17, fontWeight: '600', color: colors.greenDark }}>Get offers and new arrivals</Text>
      <Muted style={{ marginTop: 4, marginBottom: space.md }}>Occasional emails. Unsubscribe any time.</Muted>
      <Input value={email} onChangeText={setEmail} placeholder="Your email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" icon="mail-outline" />
      <Pressable onPress={() => setAgree(!agree)} style={{ flexDirection: 'row', gap: 10, marginBottom: space.md }} accessibilityRole="checkbox" accessibilityState={{ checked: agree }}>
        <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={22} color={colors.green} />
        <Body style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>I agree to the trade policy and to receive emails from ChiegoTrading.</Body>
      </Pressable>
      {msg ? <Text style={{ color: msg.ok ? colors.green : colors.danger, marginBottom: space.md }}>{msg.text}</Text> : null}
      <Button title="Subscribe" loading={busy} disabled={!email || !agree} onPress={submit} />
    </Card>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: colors.green, paddingHorizontal: space.lg, paddingBottom: space.xl, borderBottomLeftRadius: radius.lg + 8, borderBottomRightRadius: radius.lg + 8 },
  heroTitle: { color: '#fff', fontSize: 30, fontWeight: '600', letterSpacing: -0.8, lineHeight: 34, marginTop: space.xl, marginBottom: space.lg },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: radius.pill, minHeight: 50, paddingHorizontal: space.lg },
});
