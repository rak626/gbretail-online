"use client";
import { use, useEffect, useState } from "react";
import { Package, Search } from "lucide-react";
import { toast } from "sonner";
import { storeApi, type OnlineProduct, type Shop } from "@/lib/store-api";
import { useCart } from "@/store/session";
import { useSession } from "@/store/session";
import { useUI } from "@/store/ui";
import { ProductCard, ProductCardSkeleton } from "@/components/storefront/ProductCard";
import { CategoryNav } from "@/components/storefront/CategoryNav";
import { EmptyState } from "@/components/storefront/EmptyState";
import { StoreInfoCard } from "@/components/storefront/StoreInfoCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ShopPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = use(params);
  const [shop, setShopDetail] = useState<Shop | null>(null);
  const [cats, setCats] = useState<string[]>([]);
  const [cat, setCat] = useState("All");
  const [items, setItems] = useState<OnlineProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { add, setQty, lines, shopId: cartShopId } = useCart();
  const { setShop } = useSession();
  const { productSearch, setProductSearch } = useUI();
  const search = productSearch;

  useEffect(() => {
    setLoadingShop(true);
    storeApi
      .shop(shopId)
      .then((r) => {
        setShopDetail(r.shop);
        setCats(r.categories);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingShop(false));
  }, [shopId]);

  useEffect(() => {
    setLoadingItems(true);
    const t = setTimeout(() => {
      storeApi
        .products(shopId, { search, category: cat })
        .then((r) => {
          setItems(r.products);
          setTotal(r.total);
        })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoadingItems(false));
    }, 250);
    return () => clearTimeout(t);
  }, [shopId, search, cat]);

  // Keep session shop in sync so checkout knows pickup details
  useEffect(() => {
    if (shop) {
      const existing = useSession.getState().shop;
      if (!existing || existing.id !== shop.id) setShop(shop);
    }
  }, [shop, setShop]);

  function handleAdd(p: OnlineProduct) {
    if (cartShopId && cartShopId !== shopId && lines.length > 0) {
      toast.warning("Cart reset — you switched stores", {
        description: "Blinkit-style carts hold one store at a time.",
      });
    }
    add(shopId, {
      productId: p.id,
      shopProductId: p.id,
      name: p.name,
      unitPrice: p.effectivePrice,
      qty: 1,
      imageUrl: p.imageUrl,
    });
  }

  if (error && !shop) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="p-8 text-center text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (loadingShop || !shop) {
    return (
      <div className="space-y-4">
        <div className="h-36 animate-pulse rounded-3xl bg-muted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StoreInfoCard shop={shop} itemsOnline={total} />

      {/* Sticky search toolbar */}
      <div className="sticky top-[104px] z-20 -mx-3 bg-background/95 px-3 py-2 backdrop-blur sm:top-[64px] md:top-[64px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder={`Search in ${shop.name} — try "rice", "oil", "soap"…`}
            className="h-11 bg-card pl-9 shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-start gap-4">
        <CategoryNav categories={cats} active={cat} onChange={setCat} />

        <div className="min-w-0 flex-1">
          {loadingItems ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon="search"
              title={search || cat !== "All" ? "No products match" : "Nothing online yet"}
              hint={
                search || cat !== "All"
                  ? "Try a different keyword or category."
                  : "This shop hasn't listed online products yet. Check back soon."
              }
            />
          ) : (
            <>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                {cat === "All" ? "All products" : cat} · {total} item{total === 1 ? "" : "s"}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {items.map((p) => {
                  const inCart = lines.find((l) => l.productId === p.id)?.qty ?? 0;
                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      qty={cartShopId && cartShopId !== shopId ? 0 : inCart}
                      onAdd={() => handleAdd(p)}
                      onInc={() => {
                        if (cartShopId && cartShopId !== shopId) handleAdd(p);
                        else setQty(p.id, inCart + 1);
                      }}
                      onDec={() => setQty(p.id, inCart - 1)}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom padding so mobile cart bar never covers last row */}
      <div className="h-6 md:hidden" />
    </div>
  );
}
