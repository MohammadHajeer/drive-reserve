import { Ban, CheckCircle2 } from "lucide-react";

import type { Car } from "@/types/domain";

type ReservationCardProps = {
  carId: Car["id"];
  pricePerDay: Car["price_per_day"];
  status: Car["status"];
};

export function ReservationCard({
  carId,
  pricePerDay,
  status,
}: ReservationCardProps) {
  const isAvailable = status === "available";

  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      data-car-id={carId}
    >
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-foreground">
          ${pricePerDay}
        </span>
        <span className="text-sm font-medium text-muted-foreground">/ day</span>
      </div>

      <div
        className={`mt-5 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
          isAvailable
            ? "bg-primary/10 text-primary"
            : "bg-destructive/10 text-destructive"
        }`}
      >
        {isAvailable ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Ban className="h-4 w-4 shrink-0" aria-hidden="true" />
        )}
        <span>
          {isAvailable
            ? "This vehicle is currently available."
            : "This vehicle is currently unavailable."}
        </span>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
        <p className="text-sm font-semibold text-foreground">
          Reservation dates coming soon
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Date selection and reservation pricing will be added in the next
          step.
        </p>
      </div>

      <button
        type="button"
        disabled
        className="mt-6 flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-muted py-3.5 font-semibold text-muted-foreground opacity-70"
      >
        Reservation unavailable
      </button>
    </div>
  );
}
