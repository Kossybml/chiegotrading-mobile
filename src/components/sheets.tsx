import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, H2, Muted, Row } from '@/components/ui';
import { useMeta } from '@/lib/queries';
import { colors, radius, space } from '@/lib/theme';
import { useCurrency } from '@/providers/CurrencyProvider';

export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[s.sheet, { paddingBottom: insets.bottom + space.lg }]}>
        <View style={s.grab} />
        <Row style={{ justifyContent: 'space-between', marginBottom: space.md }}>
          <H2>{title}</H2>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="close" size={22} color={colors.muted} />
          </Pressable>
        </Row>
        <ScrollView style={{ maxHeight: 460 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </View>
    </Modal>
  );
}

export function CurrencySheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { data } = useMeta();
  const { currency, setCurrency } = useCurrency();
  return (
    <Sheet visible={visible} onClose={onClose} title="Display currency">
      <Muted style={{ marginBottom: space.md }}>Prices are shown in this currency as a guide. Payment is always taken in naira (₦).</Muted>
      {(data?.currencies ?? []).map((c) => (
        <Pressable
          key={c.code}
          onPress={() => {
            setCurrency(c.code);
            onClose();
          }}
          style={s.cur}
          accessibilityRole="radio"
          accessibilityState={{ selected: c.code === currency }}>
          <Text style={s.curCode}>{c.code}</Text>
          <Text style={s.curName}>{c.name}</Text>
          {c.code === currency ? <Ionicons name="checkmark-circle" size={22} color={colors.green} /> : null}
        </Pressable>
      ))}
    </Sheet>
  );
}

/** Small pill that shows the current currency and opens the picker. */
export function CurrencyPill({ light }: { light?: boolean }) {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={[s.pill, light && { backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'transparent' }]} accessibilityLabel={`Currency ${currency}. Change`}>
        <Ionicons name="globe-outline" size={14} color={light ? '#fff' : colors.green} />
        <Text style={[s.pillText, light && { color: '#fff' }]}>{currency}</Text>
      </Pressable>
      <CurrencySheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

export type Filters = { category: string; sort: string; export: boolean; seller: '' | 'official' | 'marketplace' };

export const SORTS: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name A–Z' },
];

export function FilterSheet({ visible, onClose, value, onApply }: { visible: boolean; onClose: () => void; value: Filters; onApply: (f: Filters) => void }) {
  const [f, setF] = useState(value);
  return (
    <Sheet visible={visible} onClose={onClose} title="Filter and sort">
      <Text style={s.group}>Sort by</Text>
      <Row style={{ flexWrap: 'wrap', gap: space.sm }}>
        {SORTS.map((o) => <Chip key={o.value} label={o.label} active={f.sort === o.value} onPress={() => setF({ ...f, sort: o.value })} />)}
      </Row>
      <Text style={s.group}>Sold by</Text>
      <Row style={{ flexWrap: 'wrap', gap: space.sm }}>
        <Chip label="Everyone" active={f.seller === ''} onPress={() => setF({ ...f, seller: '' })} />
        <Chip label="ChiegoTrading" active={f.seller === 'official'} onPress={() => setF({ ...f, seller: 'official' })} />
        <Chip label="Marketplace sellers" active={f.seller === 'marketplace'} onPress={() => setF({ ...f, seller: 'marketplace' })} />
      </Row>
      <Text style={s.group}>Other</Text>
      <Chip label="Export-ready only" icon="airplane" active={f.export} onPress={() => setF({ ...f, export: !f.export })} />
      <Row style={{ gap: space.sm, marginTop: space.xl }}>
        <Button title="Reset" variant="secondary" style={{ flex: 1 }} onPress={() => setF({ ...f, sort: 'newest', seller: '', export: false })} />
        <Button title="Show results" style={{ flex: 2 }} onPress={() => { onApply(f); onClose(); }} />
      </Row>
    </Sheet>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: space.lg },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: space.md },
  group: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: space.lg, marginBottom: space.sm },
  cur: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  curCode: { width: 48, fontWeight: '700', color: colors.greenDark, fontSize: 15 },
  curName: { flex: 1, color: colors.text, fontSize: 15 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, minHeight: 36, borderRadius: radius.pill, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.greenDark },
});
