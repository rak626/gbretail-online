import Link from "next/link";
import { Banknote, MapPin, Store } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-base font-black text-primary-foreground">
              G
            </span>
            <span className="text-base font-extrabold tracking-tight text-primary">GB Retail Online</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Order online from your local shop. Same inventory as the counter — order ahead, pick up in store.
          </p>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Banknote className="h-4 w-4" /> Pay in store · UPI or Cash · <MapPin className="h-3.5 w-3.5" /> Local stores
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shop</p>
          <Link href="/" className="flex items-center gap-1.5 hover:text-primary">
            <Store className="h-4 w-4" /> Browse stores
          </Link>
          <Link href="/checkout" className="block hover:text-primary">
            Cart & checkout
          </Link>
          <Link href="/orders" className="block hover:text-primary">
            My orders
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Account</p>
          <Link href="/login" className="block hover:text-primary">
            Login
          </Link>
          <Link href="/register" className="block hover:text-primary">
            Create account
          </Link>
          <p className="pt-2 text-xs text-muted-foreground">
            Same phone as in-shop purchases links your online + POS history.
          </p>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} GB Retail · Groceries from stores you trust.
        </p>
      </div>
    </footer>
  );
}
