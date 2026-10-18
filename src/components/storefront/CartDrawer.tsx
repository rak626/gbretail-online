"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react";
import { useCart, useSession } from "@/store/session";
import { useUI } from "@/store/ui";
import { inr } from "@/lib/store-api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QtyStepper } from "@/components/storefront/QtyStepper";

export function CartDrawer() {
  const { lines, shopId, setQty, clear, gross } = useCart();
  const { shop } = useSession();
  const { cartOpen, setCartOpen } = useUI();

  const grossVal = gross();
  const shopInfo = shop && shopId && shop.id === shopId ? shop : null;

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" /> My cart
            {lines.length > 0 && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
                {lines.reduce((a, l) => a + l.qty, 0)} items
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            {shopInfo ? `Pickup from ${shopInfo.name} · pay UPI or cash in store` : "Review items before checkout"}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary text-3xl">
              🛒
            </span>
            <p className="font-bold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add groceries from your local store — they&apos;ll show up here.
            </p>
            <Button onClick={() => setCartOpen(false)} className="mt-2">
              Browse stores
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {lines.map((l) => (
                <div key={l.productId} className="flex items-center gap-3">
                  {l.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.imageUrl}
                      alt={l.name}
                      className="h-12 w-12 shrink-0 rounded-xl border object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-secondary text-xl">
                      🛒
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {inr(l.unitPrice)} × {l.qty} = <span className="font-bold text-foreground">{inr(l.unitPrice * l.qty)}</span>
                    </p>
                  </div>
                  <QtyStepper
                    size="sm"
                    qty={l.qty}
                    onAdd={() => setQty(l.productId, l.qty + 1)}
                    onInc={() => setQty(l.productId, l.qty + 1)}
                    onDec={() => setQty(l.productId, l.qty - 1)}
                  />
                </div>
              ))}
              <button
                onClick={clear}
                className="flex items-center gap-1 text-xs font-semibold text-destructive hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear cart
              </button>
            </div>

            <SheetFooter>
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-base font-extrabold">{inr(grossVal)}</span>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setCartOpen(false)}>
                    Add more
                  </Button>
                  <Button asChild onClick={() => setCartOpen(false)}>
                    <Link href="/checkout">
                      Checkout <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function BottomCartBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lines, gross } = useCart();
  const { setCartOpen } = useUI();
  const count = lines.reduce((a, l) => a + l.qty, 0);
  if (count === 0) return null;
  if (pathname === "/checkout") return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 p-3 md:hidden">
      <button
        onClick={() => {
          if (pathname?.startsWith("/s/")) setCartOpen(true);
          else router.push("/checkout");
        }}
        className="mx-auto flex w-full max-w-xl items-center justify-between rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-xl active:scale-[0.99]"
      >
        <span>
          {count} item{count > 1 ? "s" : ""} · {inr(gross())}
        </span>
        <span className="flex items-center gap-1">
          View cart <ArrowRight className="h-4 w-4" />
        </span>
      </button>
    </div>
  );
}
