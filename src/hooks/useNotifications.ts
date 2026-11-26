import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';

import { pushPermissionStatus, registerPush } from '@/lib/push';
import { KEYS, store } from '@/lib/storage';
import type { User } from '@/lib/types';

/** Sends the user to the right screen when they tap a notification (`data.reference` = an order, `data.slug` = a product). */
function open(data: Record<string, unknown> | undefined) {
  if (typeof data?.reference === 'string') router.push({ pathname: '/order/[reference]', params: { reference: data.reference } });
  else if (typeof data?.slug === 'string') router.push({ pathname: '/product/[slug]', params: { slug: data.slug } });
}

export function useNotificationTaps() {
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((r) => r && open(r.notification.request.content.data));
    const sub = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification.request.content.data));
    return () => sub.remove();
  }, []);
}

/** After sign-in: explain why, ask once, then register the device. If already allowed, just refresh the token. */
export function usePushSetup(user: User | null) {
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      if ((await pushPermissionStatus()) === 'granted') return void registerPush().catch(() => undefined);
      if (await store.get(KEYS.pushAsked, false)) return;
      await store.set(KEYS.pushAsked, true);
      if (cancelled) return;
      Alert.alert('Stay up to date?', 'Get a notification when your order is paid, dispatched or delivered.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Turn on', onPress: () => void registerPush().catch(() => undefined) },
      ]);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);
}
