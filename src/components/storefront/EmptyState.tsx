import { PackageSearch, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState({
  icon = "search",
  title,
  hint,
  actionLabel,
  actionHref,
}: {
  icon?: "search" | "store" | "cart";
  title: string;
  hint?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  const Icon = icon === "store" ? Store : PackageSearch;
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </span>
        <p className="font-semibold">{title}</p>
        {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
        {actionLabel && actionHref && (
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
