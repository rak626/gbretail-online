"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, ShoppingCart, Store } from "lucide-react";
import { toast } from "sonner";
import { storeApi, inr } from "@/lib/store-api";
import { useCart, useSession } from "@/store/session";
import { QtyStepper } from "@/components/storefront/QtyStepper";
import { BillSummary } from "@/components/storefront/BillSummary";
import { EmptyState } from "@/components/storefront/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, shopId, setQty, clear, gross } = useCart();
  const { customer, shop, setShop } = useSession();
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer?.phone) setPhone(customer.phone);
  }, [customer]);

  // Hydrate shop details when landing on checkout directly
  useEffect(() => {
    if (shopId && (!shop || shop.id !== shopId)) {
      storeApi
        .shop(shopId)
        .then((r) => setShop(r.shop))
        .catch(() => {});
    }
  }, [shopId, shop, setShop]);

  const shopInfo = shop && shopId && shop.id === shopId ? shop : null;
  const grossVal = gross();
  const total = Math.round(grossVal * 100) / 100;

  async function place() {
    setError(null);
    if (!customer) {
      router.push(`/login?next=/checkout`);
      return;
    }
    if (lines.length === 0) {
      setError("Cart is empty");
      return;
    }
    if (shopInfo && !shopInfo.pickupEnabled) {
      const msg = "Pickup is not enabled for this shop yet";
      setError(msg);
      toast.error(msg);
      return;
    }
    setPlacing(true);
    try {
      const key = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      if (!shopId) {
        setError("Pick a store first");
        setPlacing(false);
        return;
      }
      const res = await storeApi.createOrder(
        {
          shopId,
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          fulfilment: "pickup",
          deliveryPhone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        key
      );
      clear();
      toast.success(`Order ${res.order.orderNumber} placed!`);
      router.push(`/orders?placed=${res.order.orderNumber}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Order failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Your cart</h1>
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          hint="Browse your local store and add groceries — checkout takes a minute."
          actionLabel="Browse stores"
          actionHref="/"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Checkout</h1>
        <Badge variant="secondary" className="gap-1">
          <ShoppingCart className="h-3 w-3" /> {lines.reduce((a, l) => a + l.qty, 0)} items
        </Badge>
        <Badge variant="delivery">Pickup · Pay in store</Badge>
        {shopInfo && (
          <Link
            href={`/s/${shopInfo.id}`}
            className="ml-auto flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <Store className="h-4 w-4" /> {shopInfo.name}
          </Link>
        )}
      </div>

      {!customer && (
        <Card className="border-accent bg-accent/20">
          <CardContent className="p-4 text-sm">
            You&apos;ll be asked to <Link href={`/login?next=/checkout`} className="font-bold text-primary underline">login or create an account</Link> when placing the order. It takes 30 seconds.
          </CardContent>
        </Card>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Items in cart</CardTitle>
              <CardDescription>Quantities update instantly — the drawer stays in sync.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {lines.map((l) => (
                <div key={l.productId} className="flex items-center gap-3">
                  {l.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.imageUrl} alt={l.name} className="h-11 w-11 shrink-0 rounded-xl border object-cover" loading="lazy" />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-secondary text-lg">🛒</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {inr(l.unitPrice)} × {l.qty} = <span className="font-bold text-foreground">{inr(l.unitPrice * l.qty)}</span>
                    </p>
                  </div>
                  <QtyStepper size="sm" qty={l.qty} onAdd={() => setQty(l.productId, l.qty + 1)} onInc={() => setQty(l.productId, l.qty + 1)} onDec={() => setQty(l.productId, l.qty - 1)} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pickup details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pickup details</CardTitle>
              <CardDescription>
                {shopInfo
                  ? <>You&apos;ll pick up from <span className="font-bold text-foreground">{shopInfo.name}</span>{shopInfo.address ? ` · ${shopInfo.address}` : ""}. We&apos;ll use your phone to tell you when it&apos;s ready.</>
                  : "We'll use your phone to tell you when your order is ready."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {shopInfo && (shopInfo.address || shopInfo.city) && (
                <p className="flex items-start gap-1.5 rounded-xl bg-secondary/60 p-3 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <span className="font-bold">{shopInfo.name}</span>
                    <br />
                    <span className="text-muted-foreground">
                      {[shopInfo.address, shopInfo.city].filter(Boolean).join(", ")}
                    </span>
                  </span>
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="co-phone" className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Phone
                  </Label>
                  <Input id="co-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" inputMode="tel" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="co-notes">Note for shop <span className="font-normal text-muted-foreground">(optional)</span></Label>
                  <Input id="co-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. call on arrival" />
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="p-4 text-sm font-medium text-destructive">{error}</CardContent>
            </Card>
          )}
        </div>

        {/* Summary */}
        <Card className="sticky top-36">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bill details</CardTitle>
            {shopInfo && <CardDescription>{shopInfo.name} · Pay in store</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <BillSummary gross={grossVal} total={total} />
            <Separator />
            <Button onClick={place} disabled={placing} size="lg" className="w-full">
              {placing ? "Placing order…" : customer ? <>Place pickup order · {inr(total)} <ArrowRight className="h-4 w-4" /></> : "Login & place order"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">We pack it, you pick it up. Pay UPI or cash at the counter.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
