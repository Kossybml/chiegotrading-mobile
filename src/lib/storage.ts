import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/** Tokens go in the device keychain / keystore (encrypted). Everything else (cart, settings) is ordinary storage. */
export const secure = {
  get: (k: string) => SecureStore.getItemAsync(k).catch(() => null),
  set: (k: string, v: string) => SecureStore.setItemAsync(k, v),
  del: (k: string) => SecureStore.deleteItemAsync(k).catch(() => undefined),
};

export const store = {
  async get<T>(k: string, fallback: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(k);
      return raw == null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },
  set: (k: string, v: unknown) => AsyncStorage.setItem(k, JSON.stringify(v)).catch(() => undefined),
  del: (k: string) => AsyncStorage.removeItem(k).catch(() => undefined),
};

export const KEYS = {
  access: 'ct_access',
  refresh: 'ct_refresh',
  cart: 'ct_cart',
  currency: 'ct_currency',
  onboarded: 'ct_onboarded',
  biometric: 'ct_biometric',
  pushToken: 'ct_push_token',
  pushAsked: 'ct_push_asked',
  orderCount: 'ct_orders_placed',
  reviewAsked: 'ct_review_asked',
};
