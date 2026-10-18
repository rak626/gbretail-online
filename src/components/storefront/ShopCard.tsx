import Link from "next/link";
import { ArrowRight, MapPin, Store } from "lucide-react";
import type { Shop } from "@/lib/store-api";
import { inr } from "@/lib/store-api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Link
      href={`/s/${shop.id}`}
      className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-black text-primary">
          {shop.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold tracking-tight group-hover:text-primary">
            {shop.name}
          </p>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {[shop.address, shop.city].filter(Boolean).join(", ") || "Local store"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {shop.pickupEnabled && <Badge variant="success">Pickup</Badge>}
            {shop.minOrderAmount > 0 && (
              <Badge variant="muted">Min {inr(shop.minOrderAmount)}</Badge>
            )}
          </div>
        </div>
        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
      {shop.onlineNote && (
        <p className="truncate border-t bg-secondary/40 px-4 py-2 text-xs text-muted-foreground">
          {shop.onlineNote}
        </p>
      )}
    </Link>
  );
}

export function ShopCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex gap-3 p-4">
        <span className="h-12 w-12 animate-pulse rounded-2xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="flex gap-1.5">
            <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ShopEmptyIcon() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
      <Store className="h-6 w-6 text-muted-foreground" />
    </span>
  );
}
