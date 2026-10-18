"use client";
import { useEffect, useMemo, useState } from "react";
import { MapPin, RefreshCw, Store } from "lucide-react";
import { storeApi, type Shop } from "@/lib/store-api";
import { useSession } from "@/store/session";
import { useUI } from "@/store/ui";
import { PickupBanner } from "@/components/storefront/DeliveryBanner";
import { ShopCard, ShopCardSkeleton } from "@/components/storefront/ShopCard";
import { EmptyState } from "@/components/storefront/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const { customer } = useSession();
  const { city, setCity, shopSearch } = useUI();
  const [cities, setCities] = useState<{ city: string; shops: number }[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    storeApi
      .cities()
      .then((r) => {
        setCities(r.cities);
        if (!city && r.cities[0]) setCity(r.cities[0].city);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!city) {
      setShops([]);
      return;
    }
    setShopsLoading(true);
    storeApi
      .shops(city)
      .then((r) => {
        setShops(r.shops);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setShopsLoading(false));
  }, [city]);

  const filtered = useMemo(() => {
    const q = shopSearch.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter((s) =>
      [s.name, s.address, s.city].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [shops, shopSearch]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-44 animate-pulse rounded-3xl bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShopCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error && shops.length === 0 && cities.length === 0) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="font-bold">Backend unreachable</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {error} — check that the API is running and NEXT_PUBLIC_API_URL is set.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PickupBanner city={city ?? ""} />

      {customer && (
        <p className="text-sm text-muted-foreground">
          Hi <span className="font-bold text-foreground">{customer.name}</span>! Your linked store is highlighted when you open it.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-sm font-semibold">
          <MapPin className="h-4 w-4 text-primary" /> Stores in
        </span>
        <Select value={city ?? ""} onValueChange={(v) => setCity(v)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c.city} value={c.city}>
                {c.city} ({c.shops})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="ml-auto">
          <Store className="h-3 w-3" /> {filtered.length} store{filtered.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {shopsLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShopCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="store"
          title={shopSearch ? `No stores match "${shopSearch}"` : `No online stores in ${city || "this city"} yet`}
          hint="Try a different search or city. New local shops come online regularly."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <ShopCard key={s.id} shop={s} />
          ))}
        </div>
      )}
    </div>
  );
}
