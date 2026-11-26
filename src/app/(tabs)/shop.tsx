import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductCard } from '@/components/ProductCard';
import { CurrencyPill, FilterSheet, type Filters } from '@/components/sheets';
import { Chip, EmptyState, ErrorState, Input, Loading, Muted, Row } from '@/components/ui';
import { useCategories, useProducts } from '@/lib/queries';
import { colors, space } from '@/lib/theme';

const DEFAULTS: Filters = { category: '', sort: 'newest', export: false, seller: '' };

export default function Shop() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; q?: string }>();
  const [filters, setFilters] = useState<Filters>({ ...DEFAULTS, category: params.category ?? '' });
  const [text, setText] = useState(params.q ?? '');
  const [q, setQ] = useState(params.q ?? '');
  const [sheet, setSheet] = useState(false);
  const cats = useCategories();

  // Links from Home set the category after this screen is already mounted.
  useEffect(() => {
    if (params.category !== undefined) setFilters((f) => ({ ...f, category: params.category ?? '' }));
  }, [params.category]);

  // Search as you type, after a short pause.
  useEffect(() => {
    const t = setTimeout(() => setQ(text.trim()), 350);
    return () => clearTimeout(t);
  }, [text]);

  const query = useProducts({ q, ...filters });
  const items = useMemo(() => query.data?.pages.flatMap((p) => p.results) ?? [], [query.data]);
  const total = query.data?.pages[0]?.count ?? 0;
  const activeCount = (filters.sort !== 'newest' ? 1 : 0) + (filters.export ? 1 : 0) + (filters.seller ? 1 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>
        <Row style={{ gap: space.sm }}>
          <View style={{ flex: 1 }}>
            <Input value={text} onChangeText={setText} placeholder="Search products" icon="search" returnKeyType="search" autoCapitalize="none" style={{ minHeight: 46 }} />
          </View>
          <Pressable onPress={() => setSheet(true)} style={[s.filterBtn, activeCount > 0 && { borderColor: colors.green }]} accessibilityLabel="Filter and sort">
            <Ionicons name="options-outline" size={22} color={colors.greenDark} />
            {activeCount > 0 ? <View style={s.dot} /> : null}
          </Pressable>
        </Row>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.md }}>
          <Chip label="All" active={!filters.category} onPress={() => setFilters({ ...filters, category: '' })} />
          {(cats.data ?? []).map((c) => (
            <Chip key={c.slug} label={`${c.name} (${c.product_count ?? 0})`} active={filters.category === c.slug} onPress={() => setFilters({ ...filters, category: c.slug })} />
          ))}
        </ScrollView>
      </View>
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: space.sm }}>
        <Muted>{query.isLoading ? 'Loading…' : `${total} ${total === 1 ? 'product' : 'products'}`}</Muted>
        <CurrencyPill />
      </Row>

      {query.isLoading ? (
        <Loading />
      ) : query.isError ? (
        <ErrorState message={(query.error as Error).message} onRetry={() => query.refetch()} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => String(p.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: space.md }}
          contentContainerStyle={{ padding: space.lg, paddingTop: space.xs, gap: space.md, flexGrow: 1 }}
          renderItem={({ item }) => <ProductCard product={item} />}
          onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
          onEndReachedThreshold={0.5}
          refreshing={query.isRefetching && !query.isFetchingNextPage}
          onRefresh={() => query.refetch()}
          keyboardDismissMode="on-drag"
          ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator color={colors.green} style={{ margin: space.lg }} /> : undefined}
          ListEmptyComponent={<EmptyState icon="search-outline" title="No products found" text="Try a different word or clear the filters." action="Clear filters" onAction={() => { setFilters(DEFAULTS); setText(''); }} />}
        />
      )}
      <FilterSheet key={String(sheet)} visible={sheet} onClose={() => setSheet(false)} value={filters} onApply={(f) => setFilters({ ...f, category: filters.category })} />
    </View>
  );
}

const s = StyleSheet.create({
  filterBtn: { width: 48, height: 48, marginBottom: space.md, borderRadius: 24, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.red },
});
