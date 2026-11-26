import type { QueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import * as StoreReview from 'expo-store-review';
import { Alert } from 'react-native';

import { api, ApiError } from './api';
import { config } from './config';
import { KEYS, store } from './storage';
import type { Order } from './types';
import { failure, success } from './utils';

/** Open Paystack in the in-app browser, then ask the server whether the payment went through. */
export async function runPayment(reference: string, qc: QueryClient): Promise<Order | null> {
  try {
    const init = await api<{ authorization_url: string }>(`/orders/${reference}/pay/`, { method: 'POST' });
    await WebBrowser.openAuthSessionAsync(init.authorization_url, `chiegotrading://${config.paymentReturnPath}`);
    const order = await api<Order>(`/orders/${reference}/verify-payment/`, { method: 'POST' });
    qc.invalidateQueries({ queryKey: ['orders'] });
    qc.invalidateQueries({ queryKey: ['order', reference] });
    if (order.status === 'paid') {
      success();
      Alert.alert('Payment received', 'Thank you! We are preparing your order.');
      askForReview();
    } else {
      Alert.alert('Payment not confirmed yet', 'If you were charged, pull down on the order to refresh in a minute.');
    }
    return order;
  } catch (e) {
    failure();
    Alert.alert('Payment', e instanceof ApiError ? e.message : 'Could not reach the payment page. Try again from your order.');
    return null;
  }
}

/** Ask for a store rating once, after a first successful payment. */
async function askForReview() {
  if (await store.get<boolean>(KEYS.reviewAsked, false)) return;
  if (await StoreReview.hasAction()) {
    await store.set(KEYS.reviewAsked, true);
    setTimeout(() => StoreReview.requestReview().catch(() => undefined), 2500);
  }
}
