import * as LocalAuthentication from 'expo-local-authentication';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { api, clearTokens, hasTokens, saveTokens, setSessionExpiredHandler } from '@/lib/api';
import { KEYS, store } from '@/lib/storage';
import type { AuthResponse, User } from '@/lib/types';
import { unregisterPush } from '@/lib/push';

type Ctx = {
  user: User | null;
  loading: boolean;
  locked: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  setSession: (r: AuthResponse) => Promise<void>;
  setUser: (u: User) => void;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
  setBiometric: (on: boolean) => Promise<boolean>;
  unlock: () => Promise<boolean>;
};

const AuthContext = createContext<Ctx | null>(null);
const LOCK_AFTER_MS = 60_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [biometricAvailable, setAvailable] = useState(false);
  const [biometricEnabled, setEnabled] = useState(false);
  const leftAt = useRef<number | null>(null);

  const clearLocal = useCallback(async () => {
    await clearTokens();
    setUserState(null);
    setLocked(false);
    qc.removeQueries({ queryKey: ['orders'] });
    qc.removeQueries({ queryKey: ['seller'] });
    qc.removeQueries({ queryKey: ['order'] });
  }, [qc]);

  // Start-up: biometric capability, then restore the session from the keychain.
  useEffect(() => {
    (async () => {
      const [hw, enrolled, on] = await Promise.all([
        LocalAuthentication.hasHardwareAsync().catch(() => false),
        LocalAuthentication.isEnrolledAsync().catch(() => false),
        store.get<boolean>(KEYS.biometric, false),
      ]);
      setAvailable(hw && enrolled);
      setEnabled(on && hw && enrolled);
      if (await hasTokens()) {
        try {
          setUserState(await api<User>('/me/'));
          if (on && hw && enrolled) setLocked(true);
        } catch (e: any) {
          if (e?.status === 401) await clearLocal(); // offline errors keep the session
        }
      }
      setLoading(false);
    })();
  }, [clearLocal]);

  useEffect(() => {
    setSessionExpiredHandler(() => void clearLocal());
    return () => setSessionExpiredHandler(null);
  }, [clearLocal]);

  // Lock again when the app has been in the background for a minute.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' || s === 'inactive') leftAt.current ??= Date.now();
      else if (s === 'active') {
        if (leftAt.current && Date.now() - leftAt.current > LOCK_AFTER_MS && biometricEnabled && user) setLocked(true);
        leftAt.current = null;
      }
    });
    return () => sub.remove();
  }, [biometricEnabled, user]);

  const unlock = useCallback(async () => {
    const r = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock ChiegoTrading', cancelLabel: 'Cancel', disableDeviceFallback: false });
    if (r.success) setLocked(false);
    return r.success;
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      user,
      loading,
      locked,
      biometricAvailable,
      biometricEnabled,
      setUser: setUserState,
      setSession: async (r) => {
        await saveTokens(r);
        setUserState(r.user);
        qc.invalidateQueries();
      },
      refreshUser: async () => setUserState(await api<User>('/me/')),
      signOut: async () => {
        const refresh = await import('@/lib/storage').then((m) => m.secure.get(m.KEYS.refresh));
        await unregisterPush().catch(() => undefined);
        if (refresh) await api('/auth/logout/', { method: 'POST', body: { refresh } }).catch(() => undefined);
        await clearLocal();
      },
      setBiometric: async (on) => {
        if (on) {
          const r = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirm to turn on app lock' });
          if (!r.success) return false;
        }
        await store.set(KEYS.biometric, on);
        setEnabled(on);
        return true;
      },
      unlock,
    }),
    [user, loading, locked, biometricAvailable, biometricEnabled, unlock, qc, clearLocal],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used inside AuthProvider');
  return c;
}
