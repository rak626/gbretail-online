"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, LogOut, MapPin, Package, Search, ShoppingCart, Store, User } from "lucide-react";
import { storeApi } from "@/lib/store-api";
import { useCart, useSession } from "@/store/session";
import { useUI } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { lines } = useCart();
  const { customer, shop, clear } = useSession();
  const { city, setCity, productSearch, setProductSearch, shopSearch, setShopSearch, setCartOpen } = useUI();
  const [cities, setCities] = useState<{ city: string; shops: number }[]>([]);
  const [cityOpen, setCityOpen] = useState(false);

  const count = lines.reduce((a, l) => a + l.qty, 0);
  const isShopPage = pathname?.startsWith("/s/");
  const searchValue = isShopPage ? productSearch : shopSearch;

  useEffect(() => {
    storeApi
      .cities()
      .then((r) => {
        setCities(r.cities);
        if (!city && r.cities[0]) setCity(r.cities[0].city);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearch(v: string) {
    if (isShopPage) setProductSearch(v);
    else {
      setShopSearch(v);
      if (pathname !== "/") router.push("/");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-black text-primary-foreground">
            G
          </span>
          <span className="hidden flex-col leading-none min-[420px]:flex">
            <span className="text-[17px] font-extrabold tracking-tight text-primary">GB Retail</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Online
            </span>
          </span>
        </Link>

        {/* Location / city */}
        <div className="relative hidden shrink-0 sm:block">
          <button
            onClick={() => setCityOpen((v) => !v)}
            className="flex max-w-[220px] items-center gap-1.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-secondary"
          >
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-[11px] font-medium leading-none text-muted-foreground">
                Pickup city
              </span>
              <span className="block truncate text-sm font-bold leading-tight">
                {city ?? "Select city"}
              </span>
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", cityOpen && "rotate-180")} />
          </button>
          {cityOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setCityOpen(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border bg-popover p-1 shadow-lg">
                {cities.map((c) => (
                  <button
                    key={c.city}
                    onClick={() => {
                      setCity(c.city);
                      setCityOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary",
                      c.city === city && "bg-secondary font-bold"
                    )}
                  >
                    <span>{c.city}</span>
                    <span className="text-xs text-muted-foreground">{c.shops} stores</span>
                  </button>
                ))}
                {cities.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Loading cities…</p>
                )}
              </div>
            </>
          )}
        </div>

        {shop && (
          <Link
            href={`/s/${shop.id}`}
            className="hidden max-w-[160px] truncate rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground hover:brightness-95 lg:block"
          >
            {shop.name}
          </Link>
        )}

        {/* Search (desktop) */}
        <div className="relative hidden min-w-0 flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={isShopPage ? 'Search Products... ' : 'Search stores…'}
            className="h-10 bg-secondary/60 pl-9"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {customer ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-secondary">
                  <Avatar>
                    <AvatarFallback className="bg-primary font-extrabold text-primary-foreground">
                      {customer.name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[100px] truncate text-sm font-semibold xl:block">
                    {customer.name}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{customer.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/orders")}>
                  <Package className="h-4 w-4" /> My orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/checkout")}>
                  <ShoppingCart className="h-4 w-4" /> My cart
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    clear();
                    router.push("/");
                  }}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">
                <User className="h-4 w-4" /> Login
              </Link>
            </Button>
          )}

          {/* Cart — Blinkit-style green pill */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:brightness-95 active:scale-[0.97] sm:px-4"
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 ? (
              <Badge variant="secondary" className="bg-white/25 px-1.5 text-primary-foreground hover:bg-white/25">
                {count}
              </Badge>
            ) : (
              <span className="hidden text-xs font-semibold opacity-80 sm:inline">empty</span>
            )}
          </button>
        </div>
      </div>

      {/* Search (mobile second row) */}
      <div className="border-t px-3 py-2 md:hidden">
        <div className="relative mx-auto max-w-7xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={isShopPage ? "Search products…" : "Search stores…"}
            className="h-9 bg-secondary/60 pl-9"
          />
        </div>
      </div>

      {/* Mobile city strip */}
      <div className="flex items-center gap-2 overflow-x-auto border-t px-3 py-1.5 no-scrollbar sm:hidden">
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" /> {city ?? "Select city"}
        </span>
        <span className="h-3 w-px shrink-0 bg-border" />
        {cities.slice(0, 6).map((c) => (
          <button
            key={c.city}
            onClick={() => setCity(c.city)}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
              c.city === city ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}
          >
            {c.city}
          </button>
        ))}
        <Link href="/" className="ml-auto flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
          <Store className="h-3.5 w-3.5" /> Stores
        </Link>
      </div>
    </header>
  );
}
