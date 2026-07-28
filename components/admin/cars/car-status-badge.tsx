import type { CarStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const styles: Record<CarStatus, string> = {
  available:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/20",
  maintenance:
    "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300 dark:ring-amber-400/20",
  inactive: "bg-muted text-muted-foreground ring-border",
};

export function CarStatusBadge({ status }: { status: CarStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset", styles[status])}>
      {status}
    </span>
  );
}
