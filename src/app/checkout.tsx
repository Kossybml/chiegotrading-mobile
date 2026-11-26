import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, Chip, H2, Input, Muted, Row, Screen } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useMeta } from '@/lib/queries';
import { runPayment } from '@/lib/payment';
import { colors, space } from '@/lib/theme';
import type { Order } from '@/lib/types';
import { failure, success } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { useCart } from '@/providers/CartProvider';

export default function Checkout() {
  const { user } = useAuth();
  const cart = useCart();
  const qc = useQueryClient();
  const { data: meta } = useMeta();
  const [f, setF] = useState({
    name: `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim(),
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: '',
    state: '',
  });
  const [ship, setShip] = useState<Order['ship_method']>('local');
  const [pay, setPay] = useState<Order['pay_method']>('invoice');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState('');
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const err = (k: string) => errors[k]?.[0];

  if (!user) {
    return (
      <Screen>
        <Card style={{ gap: space.md }}>
          <H2>Log in to place your order</H2>
          <Muted>Your cart is saved on this phone.</Muted>
          <Button title="Log in" onPress={() => router.push({ pathname: '/login', params: { next: '/checkout' } })} />
          <Button title="Create an account" variant="secondary" onPress={() => router.push({ pathname: '/register', params: { next: '/checkout' } })} />
        </Card>
      </Screen>
    );
  }

  async function place() {
    setBusy(true);
    setErrors({});
    setError('');
    try {
      const order = await api<Order>('/orders/', {
        method: 'POST',
        body: { ...f, ship_method: ship, pay_method: pay, items: cart.lines.map((l) => ({ product: l.id, quantity: l.quantity })) },
      });
      cart.clear();
      qc.invalidateQueries({ queryKey: ['orders'] });
      success();
      router.replace({ pathname: '/order/[reference]', params: { reference: order.reference } });
      if (order.pay_method === 'paystack') await runPayment(order.reference, qc);
    } catch (e) {
      failure();
      if (e instanceof ApiError) {
        setErrors(e.fields ?? {});
        setError(e.message);
      } else setError('Could not place the order. Check your connection.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      footer={
        <>
          {error ? <Text style={{ color: colors.danger, marginBottom: space.sm }}>{error}</Text> : null}
          <Button title={pay === 'paystack' ? 'Place order & pay' : 'Place order & request invoice'} icon="lock-closed" loading={busy} disabled={!cart.lines.length} onPress={place} />
        </>
      }>
      <H2>Contact</H2>
      <View style={{ height: space.sm }} />
      <Input label="Full name" value={f.name} onChangeText={set('name')} error={err('name')} autoComplete="name" textContentType="name" />
      <Input label="Email" value={f.email} onChangeText={set('email')} error={err('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      <Input label="Phone" value={f.phone} onChangeText={set('phone')} error={err('phone')} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />

      <H2>Delivery</H2>
      <Row style={{ flexWrap: 'wrap', gap: 8, marginVertical: space.sm }}>
        {meta?.ship_methods.map((m) => <Chip key={m.value} label={m.label} active={ship === m.value} onPress={() => setShip(m.value)} />)}
      </Row>
      {ship !== 'pickup' ? (
        <>
          <Input label="Address" value={f.address} onChangeText={set('address')} error={err('address')} autoComplete="street-address" textContentType="fullStreetAddress" />
          <Input label={ship === 'export' ? 'Country' : 'State'} value={f.state} onChangeText={set('state')} error={err('state')} />
        </>
      ) : <Muted style={{ marginBottom: space.md }}>Collect from our Warri office.</Muted>}

      <H2>Payment</H2>
      <Row style={{ flexWrap: 'wrap', gap: 8, marginVertical: space.sm }}>
        {meta?.pay_methods.filter((m) => m.value !== 'paystack' || meta.paystack_enabled).map((m) => <Chip key={m.value} label={m.label} active={pay === m.value} onPress={() => setPay(m.value)} />)}
      </Row>
      {pay === 'paystack' && meta ? <Muted>Card payments add a {(Number(meta.payment_fee_rate) * 100).toFixed(1)}% service fee. You pay securely on Paystack.</Muted> : <Muted>We will email you an invoice and bank details.</Muted>}
    </Screen>
  );
}
