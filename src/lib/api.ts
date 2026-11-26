import { config } from './config';
import { KEYS, secure, store } from './storage';
import type { AuthResponse } from './types';

/** The API's one error shape: {error: {code, message, fields?}}. */
export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number, public fields?: Record<string, string[]>) {
    super(message);
  }
}

let currency = 'USD';
export const setApiCurrency = (c: string) => {
  currency = c;
};

let onSessionExpired: (() => void) | null = null;
export const setSessionExpiredHandler = (fn: (() => void) | null) => {
  onSessionExpired = fn;
};

export async function saveTokens(t: { access: string; refresh: string }) {
  await secure.set(KEYS.access, t.access);
  await secure.set(KEYS.refresh, t.refresh);
}
export async function clearTokens() {
  await secure.del(KEYS.access);
  await secure.del(KEYS.refresh);
}
export const hasTokens = async () => Boolean(await secure.get(KEYS.refresh));

/** One refresh at a time: if five requests get a 401 together, they share one refresh call (the refresh token rotates). */
let refreshing: Promise<boolean> | null = null;
function refreshTokens(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const refresh = await secure.get(KEYS.refresh);
      if (!refresh) return false;
      const res = await fetch(`${config.apiUrl}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 400) {
          await clearTokens();
          onSessionExpired?.();
        }
        return false;
      }
      await saveTokens((await res.json()) as { access: string; refresh: string });
      return true;
    } catch {
      return false; // offline: keep the tokens, try again later
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  form?: FormData;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
};

export async function api<T = unknown>(path: string, opts: Options = {}, retried = false): Promise<T> {
  const { method = 'GET', body, form, auth = true, query } = opts;
  const qs = query
    ? '?' + Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
    : '';
  const url = path.startsWith('http') ? path : `${config.apiUrl}${path}${qs === '?' ? '' : qs}`;
  const headers: Record<string, string> = { Accept: 'application/json', 'X-Currency': currency };
  if (!form && body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const access = await secure.get(KEYS.access);
    if (access) headers.Authorization = `Bearer ${access}`;
  }
  let res: Response;
  try {
    res = await fetch(url, { method, headers, body: form ?? (body !== undefined ? JSON.stringify(body) : undefined) });
  } catch {
    throw new ApiError('network_error', 'No connection. Check your internet and try again.', 0);
  }
  if (res.status === 401 && auth && !retried && (await refreshTokens())) return api<T>(path, opts, true);
  if (res.status === 204) return null as T;
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const e = data?.error;
    throw new ApiError(e?.code ?? 'error', e?.message ?? 'Something went wrong. Please try again.', res.status, e?.fields);
  }
  return data as T;
}

/** Build a multipart field for a picked image (file:// uri from the camera or gallery). */
export function imagePart(uri: string, name = 'photo'): { uri: string; name: string; type: string } {
  const ext = (uri.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  return { uri, name: `${name}.${ext === 'jpeg' ? 'jpg' : ext}`, type };
}

export async function signInWith(path: string, body: unknown): Promise<AuthResponse> {
  const r = await api<AuthResponse>(path, { method: 'POST', body, auth: false });
  await saveTokens(r);
  return r;
}

export { store };
