"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Package, Store, XCircle } from "lucide-react";
import { toast } from "sonner";
import { storeApi, inr, type OnlineOrder } from "@/lib/store-api";
import { useSession } from "@/store/session";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/storefront/EmptyState";

function statusVariant(status: string): "warning" | "info" | "success" | "destructive" | "muted" {
  const s = status.toLowerCase();
  if (s === "pending") return "warning";
  if (s === "confirmed" || s === "processing" || s === "packed") return "info";
  if (s === "delivered" || s === "completed") return "success";
  if (s === "cancelled" || s === "rejected") return "destructive";
  return "muted";
}

function OrdersList() {
  const params = useSearchParams();
  const placed = params.get("placed");
  const { customer } = useSession();
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) {
      setLoading(false);
      return;
    }
    setLoading(true);
    storeApi
      .myOrders()
      .then((r) => {
        setOrders(r.orders);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [customer]);

  async function cancel(id: string) {
    setCancelling(id);
    try {
      await storeApi.cancelOrder(id);
      const r = await storeApi.myOrders();
      setOrders(r.orders);
      toast.success("Order cancelled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setCancelling(null);
    }
  }

  if (!customer) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-6">
        <h1 className="text-2xl font-extrabold tracking-tight">My orders</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Package className="h-8 w-8 text-muted-foreground" />
            <p className="font-semibold">Login to see your orders</p>
            <p className="text-sm text-muted-foreground">Your online orders from all GB Retail stores appear here.</p>
            <Button asChild>
              <Link href="/login?next=/orders">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">My orders</h1>
        {orders.length > 0 && <Badge variant="secondary">{orders.length}</Badge>}
      </div>

      {placed && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm">
              <span className="font-bold">Order {placed} placed!</span> We&apos;ll pack it — pay UPI or cash at pickup.
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-2 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 && !error ? (
        <EmptyState
          icon="cart"
          title="No orders yet"
          hint="Your pending, confirmed and completed pickup orders will show up here."
          actionLabel="Browse stores"
          actionHref="/"
        />
      ) : (
        orders.map((o) => (
          <Card key={o.id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold">{o.orderNumber}</span>
                <Badge variant={statusVariant(o.status)} className="uppercase">
                  {o.status}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Store className="h-3 w-3" /> {o.shop?.name ?? "Pickup"}
                </Badge>
                <span className="ml-auto text-base font-extrabold">{inr(o.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <Separator className="mb-3" />
              <ul className="space-y-1.5 text-sm">
                {o.items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-muted-foreground">
                      <span className="font-semibold text-foreground">{it.name}</span> × {it.quantity ?? it.weight ?? 1}
                    </span>
                    <span className="shrink-0 font-semibold">{inr(it.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              {o.status === "pending" && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={cancelling === o.id}
                  onClick={() => cancel(o.id)}
                  className="mt-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <XCircle className="h-4 w-4" /> {cancelling === o.id ? "Cancelling…" : "Cancel order"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl space-y-3"><Skeleton className="h-32 w-full" /></div>}>
      <OrdersList />
    </Suspense>
  );
}
