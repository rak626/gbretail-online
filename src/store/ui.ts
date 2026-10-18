"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  city: string | null;
  productSearch: string;
  shopSearch: string;
  cartOpen: boolean;
  setCity: (city: string | null) => void;
  setProductSearch: (v: string) => void;
  setShopSearch: (v: string) => void;
  setCartOpen: (v: boolean) => void;
};

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      city: null,
      productSearch: "",
      shopSearch: "",
      cartOpen: false,
      setCity: (city) => set({ city }),
      setProductSearch: (productSearch) => set({ productSearch }),
      setShopSearch: (shopSearch) => set({ shopSearch }),
      setCartOpen: (cartOpen) => set({ cartOpen }),
    }),
    { name: "gbretail-online-ui", partialize: (s) => ({ city: s.city }) as UIState }
  )
);
