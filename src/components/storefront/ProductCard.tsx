"use client";
import { Package } from "lucide-react";
import type { OnlineProduct } from "@/lib/store-api";
import { inr } from "@/lib/store-api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QtyStepper } from "@/components/storefront/QtyStepper";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  qty,
  onAdd,
  onInc,
  onDec,
}: {
  product: OnlineProduct;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}) {
  const outOfStock = product.stockQuantity <= 0;
  return (
    <Card className={cn("group flex flex-col overflow-hidden transition-all hover:shadow-md", outOfStock && "opacity-75")}>
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/50">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/50" />
          </span>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2">
            <Badge variant="destructive">Out of stock</Badge>
          </span>
        )}
        {product.category && (
          <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate">
            <Badge variant="secondary" className="bg-white/90 text-[11px] hover:bg-white/90">
              {product.category}
            </Badge>
          </span>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug" title={product.name}>
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground">per {product.unit}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span className="text-[15px] font-extrabold tracking-tight">{inr(product.effectivePrice)}</span>
          {outOfStock ? (
            <span className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-muted-foreground">
              Unavailable
            </span>
          ) : (
            <QtyStepper qty={qty} onAdd={onAdd} onInc={onInc} onDec={onDec} size="sm" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <CardContent className="space-y-2 p-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-7 w-[76px] animate-pulse rounded-lg bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
