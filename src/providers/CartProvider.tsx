import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { KEYS, store } from '@/lib/storage';
import type { Product } from '@/lib/types';
import { success, tap } from '@/lib/utils';

/** The cart lives on the phone (so it works signed out); prices are re-checked by the server with /orders/quote/. */
export type CartLine = { id: number; slug: string; name: string; unit: string; moq: number; image: string; quantity: number };

type Ctx = {
  lines: CartLine[];
  count: number;
  ready: boolean;
  add: (p: Product, qty?: number) => void;
  setQuantity: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};
const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    store.get<CartLine[]>(KEYS.cart, []).then((l) => {
      setLines(l);
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (ready) store.set(KEYS.cart, lines);
  }, [lines, ready]);

  const add = useCallback((p: Product, qty?: number) => {
    const q = Math.max(qty ?? p.moq, p.moq);
    setLines((cur) => {
      const found = cur.find((l) => l.id === p.id);
      if (found) return cur.map((l) => (l.id === p.id ? { ...l, quantity: l.quantity + q } : l));
      return [...cur, { id: p.id, slug: p.slug, name: p.name, unit: p.unit, moq: p.moq, image: p.images.thumb, quantity: q }];
    });
    success();
  }, []);
  const setQuantity = useCallback((id: number, qty: number) => {
    tap();
    setLines((cur) => cur.map((l) => (l.id === id ? { ...l, quantity: Math.max(l.moq, Math.min(100000, qty)) } : l)));
  }, []);
  const remove = useCallback((id: number) => setLines((cur) => cur.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(() => ({ lines, count: lines.reduce((n, l) => n + l.quantity, 0), ready, add, setQuantity, remove, clear }), [lines, ready, add, setQuantity, remove, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}
