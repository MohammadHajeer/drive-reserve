import type { CarStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const styles: Record<CarStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  maintenance: "bg-amber-50 text-amber-700 ring-amber-200",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function CarStatusBadge({ status }: { status: CarStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset", styles[status])}>
      {status}
    </span>
  );
}
