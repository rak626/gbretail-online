"use client";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QtyStepper({
  qty,
  onAdd,
  onInc,
  onDec,
  size = "md",
  className,
}: {
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  size?: "md" | "sm";
  className?: string;
}) {
  if (qty === 0) {
    return (
      <Button
        variant="outline"
        size={size === "sm" ? "xs" : "sm"}
        onClick={onAdd}
        className={cn(
          "border-primary font-extrabold uppercase tracking-wider text-primary shadow-sm hover:bg-primary hover:text-primary-foreground",
          size === "sm" ? "h-7 px-4 text-xs" : "h-8 px-6 text-sm",
          className
        )}
      >
        Add
      </Button>
    );
  }
  return (
    <div
      className={cn(
        "inline-flex items-center justify-between gap-1 rounded-lg bg-primary font-bold text-primary-foreground shadow-sm",
        size === "sm" ? "h-7 w-[76px] px-1 text-xs" : "h-8 w-[92px] px-1 text-sm",
        className
      )}
    >
      <button
        aria-label="Decrease quantity"
        onClick={onDec}
        className="flex h-full w-7 items-center justify-center rounded-md transition-colors hover:bg-white/20"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
      <span className="min-w-5 text-center tabular-nums">{qty}</span>
      <button
        aria-label="Increase quantity"
        onClick={onInc}
        className="flex h-full w-7 items-center justify-center rounded-md transition-colors hover:bg-white/20"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
    </div>
  );
}
