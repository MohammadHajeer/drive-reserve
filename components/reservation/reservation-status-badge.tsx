import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/domain";

const statusStyles: Record<ReservationStatus, string> = {
  pending:
    "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  confirmed:
    "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  active:
    "border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-300",
  completed: "border-border bg-muted text-muted-foreground",
  cancelled:
    "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
  rejected:
    "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
};

export function ReservationStatusBadge({
  status,
}: {
  status: ReservationStatus;
}) {
  return (
    <Badge variant="outline" className={cn("capitalize", statusStyles[status])}>
      {status}
    </Badge>
  );
}
