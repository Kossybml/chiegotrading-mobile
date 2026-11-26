import { useQueryClient } from '@tanstack/react-query';
import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { setApiCurrency } from '@/lib/api';
import { KEYS, store } from '@/lib/storage';
import { currencyForRegion } from '@/lib/utils';

type Ctx = { currency: string; setCurrency: (c: string) => void };
const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [currency, set] = useState('USD');

  useEffect(() => {
    store.get<string | null>(KEYS.currency, null).then((saved) => {
      const c = saved ?? currencyForRegion(getLocales()[0]?.regionCode);
      setApiCurrency(c);
      set(c);
    });
  }, []);

  const setCurrency = useCallback(
    (c: string) => {
      setApiCurrency(c);
      set(c);
      store.set(KEYS.currency, c);
      qc.invalidateQueries(); // every price on screen is re-fetched in the new currency
    },
    [qc],
  );
  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => {
  const c = useContext(CurrencyContext);
  if (!c) throw new Error('useCurrency must be used inside CurrencyProvider');
  return c;
};
