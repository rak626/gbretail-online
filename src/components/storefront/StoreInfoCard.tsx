import { Banknote, Mail, MapPin, Navigation, Package, Phone, Store, Timer } from "lucide-react";
import type { Shop } from "@/lib/store-api";
import { inr } from "@/lib/store-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Pickup store info banner — everything a customer needs to find and
 * collect their order: location, timing, contact. Real data only.
 */
export function StoreInfoCard({ shop, itemsOnline }: { shop: Shop; itemsOnline: number }) {
  const location = [shop.address, shop.city].filter(Boolean).join(", ");
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [shop.name, location].filter(Boolean).join(", ")
  )}`;

  return (
    <section className="overflow-hidden rounded-3xl border bg-card">
      <div className="flex flex-wrap items-start gap-3 p-4 sm:p-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-primary-foreground">
          {shop.name.slice(0, 1).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1 basis-48">
          <div className="flex flex-wrap items-center gap-1.5">
            <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{shop.name}</h1>
            {shop.pickupEnabled && <Badge variant="success">Pickup</Badge>}
          </div>

          {location && (
            <p className="mt-1 flex items-start gap-1 text-[13px] text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="line-clamp-2">{location}</span>
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            {shop.avgPrepMinutes != null && (
              <span className="flex items-center gap-1 rounded-full bg-delivery px-2.5 py-0.5 font-bold text-delivery-foreground">
                <Timer className="h-3 w-3" /> Ready in ~{shop.avgPrepMinutes} min
              </span>
            )}
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground">
              <Package className="h-3 w-3" /> {itemsOnline} items online
            </span>
            {shop.minOrderAmount > 0 && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground">
                Min {inr(shop.minOrderAmount)}
              </span>
            )}
          </div>

          {shop.onlineNote && (
            <p className="mt-1.5 flex items-start gap-1 text-[13px] text-muted-foreground">
              <Store className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {shop.onlineNote}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
          {shop.phone && (
            <Button asChild variant="outline" size="sm">
              <a href={`tel:${shop.phone}`}>
                <Phone className="h-4 w-4" /> Call store
              </a>
            </Button>
          )}
          {shop.email && (
            <Button asChild variant="outline" size="sm">
              <a href={`mailto:${shop.email}`}>
                <Mail className="h-4 w-4" /> Email
              </a>
            </Button>
          )}
          {location && (
            <Button asChild variant="outline" size="sm">
              <a href={directionsUrl} target="_blank" rel="noreferrer">
                <Navigation className="h-4 w-4" /> Directions
              </a>
            </Button>
          )}
        </div>
      </div>

      <p className="flex items-center gap-1.5 border-t bg-secondary/40 px-4 py-2 text-xs font-medium text-muted-foreground sm:px-5">
        <Banknote className="h-3.5 w-3.5" /> Order ahead, pick up in store — pay UPI or cash at the counter.
      </p>
    </section>
  );
}
