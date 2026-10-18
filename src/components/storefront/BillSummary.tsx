import { Banknote } from "lucide-react";
import { inr } from "@/lib/store-api";
import { Separator } from "@/components/ui/separator";

export function BillSummary({ gross, total }: { gross: number; total: number }) {
  return (
    <div className="space-y-2.5 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Item total</span>
        <span className="font-semibold">{inr(gross)}</span>
      </div>
      <Separator />
      <div className="flex justify-between text-base">
        <span className="flex items-center gap-1.5 font-extrabold">
          Total <Banknote className="h-4 w-4 text-muted-foreground" />
        </span>
        <span className="font-extrabold">{inr(total)}</span>
      </div>
      <p className="text-xs text-muted-foreground">Pay in store — UPI or cash at pickup.</p>
    </div>
  );
}
