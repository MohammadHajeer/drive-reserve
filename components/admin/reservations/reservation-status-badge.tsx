import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/domain";

const styles: Record<ReservationStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  active: "bg-violet-50 text-violet-700 ring-violet-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
};
export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset", styles[status])}>{status}</span>;
}
