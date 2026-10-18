"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnlineUser, Shop } from "@/lib/store-api";
import { setToken } from "@/lib/store-api";

type SessionState = {
  /** Global online account (no shop attached). */
  user: OnlineUser | null;
  /** @deprecated Use `user` — per-shop customer accounts were retired. */
  customer: OnlineUser | null;
  /** Shop context from browsing (catalog/checkout), not from login. */
  shop: Shop | null;
  setSession: (user: OnlineUser, token: string) => void;
  setShop: (shop: Shop | null) => void;
  clear: () => void;
};

export const useSession = create<SessionState>()((set) => ({
  user: null,
  customer: null,
  shop: null,
  setSession: (user, token) => {
    setToken(token);
    set({ user, customer: user });
  },
  setShop: (shop) => set({ shop }),
  clear: () => {
    setToken(null);
    set({ user: null, customer: null });
  },
}));

export type CartLine = { productId: string; name: string; unitPrice: number; qty: number; imageUrl: string | null };

type CartState = {
  shopId: string | null;
  lines: CartLine[];
  add: (shopId: string, line: CartLine) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: () => number;
  gross: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      shopId: null,
      lines: [],
      add: (shopId, line) =>
        set((s) => {
          // One shop per cart — switching shops resets.
          if (s.shopId && s.shopId !== shopId) return { shopId, lines: [line] };
          const ex = s.lines.find((l) => l.productId === line.productId);
          if (ex) {
            return {
              shopId,
              lines: s.lines.map((l) =>
                l.productId === line.productId ? { ...l, qty: Math.min(999, l.qty + line.qty) } : l
              ),
            };
          }
          return { shopId, lines: [...s.lines, line] };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.productId !== productId)
              : s.lines.map((l) => (l.productId === productId ? { ...l, qty: Math.min(999, qty) } : l)),
        })),
      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [], shopId: null }),
      count: () => get().lines.reduce((a, l) => a + l.qty, 0),
      gross: () => Math.round(get().lines.reduce((a, l) => a + l.unitPrice * l.qty, 0) * 100) / 100,
    }),
    { name: "gbretail-online-cart" }
  )
);
