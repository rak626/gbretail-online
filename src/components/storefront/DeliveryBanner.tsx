import { Banknote, ShoppingBag, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PickupBanner({ city }: { city: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-delivery p-5 text-delivery-foreground sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/25 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/20 blur-2xl"
      />
      <div className="relative space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-black/80 text-white hover:bg-black/80">
            <Timer className="h-3 w-3" /> Ready for pickup
          </Badge>
          <Badge variant="outline" className="border-black/20 bg-white/60">
            <Banknote className="h-3 w-3" /> Pay in store · UPI or Cash
          </Badge>
        </div>
        <h1 className="max-w-xl text-2xl font-black leading-tight tracking-tight sm:text-[32px]">
          Groceries from {city || "your local"} stores, ready for pickup.
        </h1>
        <p className="max-w-lg text-sm font-medium opacity-80">
          Same inventory as the shop counter. Order online, we pack it, you pick it up — pay UPI or cash at the counter.
        </p>
        <p className="flex items-center gap-1.5 pt-1 text-xs font-bold uppercase tracking-wider opacity-70">
          <ShoppingBag className="h-4 w-4" /> Pickup only · Local shops you trust
        </p>
      </div>
    </section>
  );
}
