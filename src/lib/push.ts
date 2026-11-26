import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { api } from './api';
import { config } from './config';
import { KEYS, store } from './storage';

// Show notifications while the app is open too.
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

/** Ask permission, get the Expo push token and tell the server. Returns the token, or null if not possible/allowed. */
export async function registerPush(): Promise<string | null> {
  if (!Device.isDevice) return null; // simulators can't receive push
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', { name: 'Orders and updates', importance: Notifications.AndroidImportance.DEFAULT, lightColor: '#2f6b2a' });
  }
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return null;
  const projectId = config.easProjectId || (Constants.expoConfig?.extra as any)?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) return null; // run `npx eas-cli init` first
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await api('/me/devices/', { method: 'POST', body: { token, platform: Platform.OS === 'ios' ? 'ios' : 'android' } });
  await store.set(KEYS.pushToken, token);
  return token;
}

export async function unregisterPush() {
  const token = await store.get<string | null>(KEYS.pushToken, null);
  if (!token) return;
  await api('/me/devices/', { method: 'DELETE', body: { token, platform: Platform.OS === 'ios' ? 'ios' : 'android' } }).catch(() => undefined);
  await store.del(KEYS.pushToken);
}

export async function pushPermissionStatus() {
  return (await Notifications.getPermissionsAsync()).status;
}
