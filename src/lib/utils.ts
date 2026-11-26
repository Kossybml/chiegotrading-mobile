import * as Haptics from 'expo-haptics';
import { Linking, Platform, Share } from 'react-native';

import type { Money, OrderStatus } from './types';
import { colors } from './theme';

/** Light tap for small actions, success/error buzz for outcomes. Never throws (simulators have no haptics). */
export const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
export const success = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
export const failure = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);

export const naira = (v: string | number) => `₦${Number(v).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;

/** Show the converted price first and the exact naira charge second, unless the user already views naira. */
export function priceLabel(m: Money): { main: string; sub: string } {
  return m.currency === 'NGN' ? { main: m.display, sub: '' } : { main: m.display, sub: naira(m.ngn) };
}

export const dateLabel = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function timeAgo(iso: string): string {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
  const d = Math.round(h / 24);
  return `${d} ${d === 1 ? 'day' : 'days'} ago`;
}

export function statusColor(s: OrderStatus | string): { bg: string; fg: string } {
  switch (s) {
    case 'paid':
    case 'processing':
    case 'delivered':
      return { bg: '#e3f3dd', fg: colors.green };
    case 'shipped':
      return { bg: '#e0eefc', fg: '#1456a0' };
    case 'cancelled':
      return { bg: '#f6e0de', fg: colors.danger };
    default:
      return { bg: '#fdf0d5', fg: colors.warn };
  }
}

/** Native share sheet. */
export async function shareText(message: string, url?: string) {
  try {
    await Share.share(Platform.OS === 'ios' ? { message, url } : { message: url ? `${message}\n${url}` : message });
  } catch {
    /* dismissed */
  }
}

export const call = (phone: string) => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
export const email = (to: string, subject = '') => Linking.openURL(`mailto:${to}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`);
export const whatsapp = (phone: string, text = '') => Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`);
export const openMap = (address: string) =>
  Linking.openURL(Platform.OS === 'ios' ? `http://maps.apple.com/?q=${encodeURIComponent(address)}` : `geo:0,0?q=${encodeURIComponent(address)}`);

export const stripHtml = (html: string) =>
  html
    .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** Currency to start with, from the phone's region (the user can change it in Settings). */
const REGION_CURRENCY: Record<string, string> = { NG: 'NGN', GB: 'GBP', US: 'USD', CA: 'CAD', GH: 'GHS', ZA: 'ZAR', KE: 'KES', DE: 'EUR', FR: 'EUR', NL: 'EUR', IT: 'EUR', ES: 'EUR', IE: 'EUR', AE: 'AED', CN: 'CNY', IN: 'INR' };
export const currencyForRegion = (region?: string | null) => (region && REGION_CURRENCY[region]) || 'USD';
