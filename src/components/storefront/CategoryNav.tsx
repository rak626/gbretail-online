"use client";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryNav({
  categories,
  active,
  onChange,
}: {
  categories: string[];
  active: string;
  onChange: (c: string) => void;
}) {
  const all = ["All", ...categories];
  return (
    <>
      {/* Mobile: horizontal pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar lg:hidden">
        {all.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
              active === c
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Desktop: Blinkit-style left rail */}
      <nav className="sticky top-32 hidden w-48 shrink-0 self-start overflow-hidden rounded-2xl border bg-card lg:block">
        <p className="border-b px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Categories
        </p>
        <ul className="max-h-[60vh] overflow-y-auto p-1.5">
          {all.map((c) => (
            <li key={c}>
              <button
                onClick={() => onChange(c)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  active === c
                    ? "bg-primary/10 font-bold text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {c === "All" && <LayoutGrid className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate">{c}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
