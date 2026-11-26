/** Maps website links (https://chiegotrading.com/shop/<slug>/) and payment returns onto app screens. */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    const url = new URL(path, 'https://app.local');
    const p = url.pathname.replace(/\/+$/, '');
    let m = p.match(/^\/shop\/([^/]+)$/);
    if (m) return `/product/${m[1]}`;
    m = p.match(/^\/orders\/([^/]+)$/);
    if (m) return `/order/${m[1]}`;
    if (p === '/shop') return '/(tabs)/shop';
    if (p === '/orders' || p.endsWith('/payment-complete')) return '/(tabs)/orders';
    if (p === '/cart') return '/(tabs)/cart';
    return path;
  } catch {
    return '/';
  }
}
