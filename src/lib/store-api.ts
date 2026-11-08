// Storefront API client — talks to backend core via public /api/store/*.
// Customer token persists in localStorage (customer UX, unlike POS staff memory token).
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export type Shop = {
  id: string; code: string; name: string; address: string | null; city: string | null;
  phone: string | null; email: string | null; pickupEnabled: boolean; deliveryEnabled: boolean; codEnabled: boolean;
  deliveryFee: number; freeDeliveryAbove: number | null; minOrderAmount: number; onlineNote: string | null;
  avgPrepMinutes: number | null;
};

export type OnlineProduct = {
  id: string; shopId: string; name: string; category: string; unit: string;
  is_loose: boolean; price: number | null; rate_per_kg: number | null;
  onlinePrice: number | null; effectivePrice: number; imageUrl: string | null;
  stockQuantity: number;
  barcode: string | null;
  brand: string | null;
  lowStockThreshold: number;
  preset_weights: number[];
  preset_prices: number[];
};

// Global online account — one person, every store. No shop attached.
export type OnlineUser = {
  id: string; name: string; phone: string | null; email: string | null;
  address: string | null;
};
/** @deprecated Use OnlineUser — per-shop customer accounts were retired. */
export type Customer = OnlineUser & { shopId?: string; totalOrders?: number; totalSpent?: number };

export type OnlineOrder = {
  id: string; orderNumber: string; total: number; status: string; channel: string;
  fulfilment: string | null; deliveryAddress: string | null; createdAt: string;
  shop?: { id: string; name: string } | null;
  items: { id: string; name: string; price: number; quantity: number | null; weight: number | null; lineTotal: number }[];
};

const TOKEN_KEY = "gbretail_customer_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (typeof window === "undefined") return;
  if (t) window.localStorage.setItem(TOKEN_KEY, t);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class StoreError extends Error {
  status: number;
  code?: string;
  customer?: { id: string; name: string; phone: string; shopId: string } | null;
  otherShop?: { id: string; name: string; code: string } | null;
  constructor(message: string, status: number, code?: string, customer?: { id: string; name: string; phone: string; shopId: string } | null, otherShop?: { id: string; name: string; code: string } | null) {
    super(message);
    this.status = status;
    this.code = code;
    this.customer = customer ?? null;
    this.otherShop = otherShop ?? null;
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new StoreError(
    (data as any).error || `HTTP ${res.status}`,
    res.status,
    (data as any).code,
    (data as any).customer,
    (data as any).otherShop,
  );
  return data as T;
}

export const storeApi = {
  cities: () => req<{ cities: { city: string; shops: number }[] }>("/api/store/cities"),
  shops: (city?: string) =>
    req<{ shops: Shop[] }>(`/api/store/shops${city ? `?city=${encodeURIComponent(city)}` : ""}`),
  shop: (id: string) => req<{ shop: Shop; categories: string[] }>(`/api/store/shops/${id}`),
  products: (shopId: string, params?: { search?: string; category?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.category && params.category !== "All") q.set("category", params.category);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return req<{ products: OnlineProduct[]; total: number; page: number; limit: number }>(
      `/api/store/shops/${shopId}/products${qs ? `?${qs}` : ""}`
    );
  },
  register: (body: {
    name: string;
    phone: string;
    email: string;
    password: string;
    address?: string;
    confirmLink?: boolean;
  }) => req<{ accessToken: string; user: OnlineUser }>("/api/store/register", {
    method: "POST",
    body: JSON.stringify(body),
  }),
  login: (body: { email: string; password: string }) =>
    req<{ accessToken: string; user: OnlineUser }>("/api/store/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  logout: () => req<{ success: boolean }>("/api/store/logout", { method: "POST" }),
  me: () => req<{ user: OnlineUser }>("/api/store/me"),
  createOrder: (
    // shopId comes from the cart (global account orders from any shop).
    body: { shopId: string; items: { productId: string; shopProductId?: string; qty: number }[]; fulfilment: "pickup" | "delivery"; deliveryAddress?: string; deliveryPhone?: string; notes?: string },
    idempotencyKey?: string
  ) =>
    req<{ order: OnlineOrder }>(`/api/store/orders`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {},
    }),
  myOrders: () => req<{ orders: OnlineOrder[] }>("/api/store/orders/mine"),
  cancelOrder: (id: string) => req<{ order: OnlineOrder }>(`/api/store/orders/${id}/cancel`, { method: "POST" }),
};

export function inr(n: number): string {
  return `₹${Number(n || 0).toFixed(2)}`;
}
