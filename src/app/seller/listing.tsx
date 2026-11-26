import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';

import { Button, Chip, Input, Loading, Muted, Row, Screen } from '@/components/ui';
import { api, ApiError, imagePart } from '@/lib/api';
import { choosePhoto } from '@/lib/photo';
import { useCategories, useListing } from '@/lib/queries';
import { colors, space } from '@/lib/theme';
import type { Listing } from '@/lib/types';
import { failure, success } from '@/lib/utils';

const empty = { name: '', category: '', grade: '', description: '', price: '', unit: 'kg', moq: '1', origin: '', stock_note: '', export_ready: false };

export default function ListingForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = id ? Number(id) : 0;
  const qc = useQueryClient();
  const existing = useListing(editing, !!editing);
  const cats = useCategories();
  const [f, setF] = useState(empty);
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const l = existing.data;
    if (l) setF({ name: l.name, category: l.category ?? '', grade: l.grade, description: l.description, price: l.price, unit: l.unit, moq: String(l.moq), origin: l.origin, stock_note: l.stock_note, export_ready: l.export_ready });
  }, [existing.data]);

  if (editing && existing.isLoading) return <Loading />;
  const set = (k: keyof typeof empty) => (v: any) => setF((s) => ({ ...s, [k]: v }));
  const err = (k: string) => errors[k]?.[0];

  async function save() {
    setBusy(true);
    setErrors({});
    try {
      const body = { ...f, category: f.category || null, moq: Number(f.moq) || 1 };
      const l = await api<Listing>(editing ? `/seller/listings/${editing}/` : '/seller/listings/', { method: editing ? 'PATCH' : 'POST', body });
      if (photo) {
        const form = new FormData();
        form.append('image', imagePart(photo, 'product') as any);
        await api(`/seller/listings/${l.id}/image/`, { method: 'PUT', form });
      }
      qc.invalidateQueries({ queryKey: ['seller'] });
      success();
      Alert.alert('Saved', 'Your listing is now waiting for approval.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (e) {
      failure();
      if (e instanceof ApiError) setErrors(e.fields ?? { name: [e.message] });
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    Alert.alert('Delete listing?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api(`/seller/listings/${editing}/`, { method: 'DELETE' }); qc.invalidateQueries({ queryKey: ['seller'] }); router.back(); } },
    ]);
  }

  const shown = photo ?? existing.data?.images.medium;
  return (
    <Screen>
      <Stack.Screen options={{ title: editing ? 'Edit listing' : 'New listing' }} />
      <Pressable accessibilityLabel="Add product photo" onPress={() => choosePhoto(setPhoto, false)}>
        {shown ? (
          <Image source={{ uri: shown }} style={{ width: '100%', height: 200, borderRadius: 14 }} contentFit="cover" />
        ) : (
          <View style={{ height: 140, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.green, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.green, fontWeight: '600' }}>Add a photo (camera or gallery)</Text>
          </View>
        )}
      </Pressable>
      <Button title={shown ? 'Change photo' : 'Take or choose photo'} variant="ghost" icon="camera-outline" onPress={() => choosePhoto(setPhoto, false)} />

      <Input label="Product name" value={f.name} onChangeText={set('name')} error={err('name')} />
      <Muted style={{ marginBottom: 6 }}>Category</Muted>
      <Row style={{ flexWrap: 'wrap', gap: 8, marginBottom: space.md }}>
        {cats.data?.map((c) => <Chip key={c.slug} label={c.name} active={f.category === c.slug} onPress={() => set('category')(f.category === c.slug ? '' : c.slug)} />)}
      </Row>
      <Input label="Price per unit (₦)" value={f.price} onChangeText={set('price')} error={err('price')} keyboardType="decimal-pad" />
      <Row style={{ gap: space.md }}>
        <View style={{ flex: 1 }}><Input label="Unit" value={f.unit} onChangeText={set('unit')} error={err('unit')} autoCapitalize="none" /></View>
        <View style={{ flex: 1 }}><Input label="Minimum order" value={f.moq} onChangeText={set('moq')} error={err('moq')} keyboardType="number-pad" /></View>
      </Row>
      <Input label="Grade / size (optional)" value={f.grade} onChangeText={set('grade')} />
      <Input label="Origin (optional)" value={f.origin} onChangeText={set('origin')} />
      <Input label="Stock note (optional)" value={f.stock_note} onChangeText={set('stock_note')} />
      <Input label="Description" value={f.description} onChangeText={set('description')} multiline style={{ minHeight: 100, textAlignVertical: 'top', paddingTop: 12 }} />
      <Row style={{ justifyContent: 'space-between', marginBottom: space.lg }}>
        <Text style={{ color: colors.text }}>Export-ready</Text>
        <Switch value={f.export_ready} trackColor={{ true: colors.green }} onValueChange={set('export_ready')} />
      </Row>
      <Muted style={{ marginBottom: space.md }}>Every new listing or edit is reviewed before it goes live.</Muted>
      <Button title="Save listing" loading={busy} disabled={!f.name || !f.price} onPress={save} />
      {editing ? <Button title="Delete listing" variant="danger" onPress={remove} style={{ marginTop: space.md }} /> : null}
    </Screen>
  );
}
