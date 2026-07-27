import { CalendarX2, RefreshCw, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ReservationsLoadingSkeleton() {
  return (
    <div
      aria-label="Loading reservations"
      className="overflow-hidden rounded-2xl border bg-card"
    >
      <Skeleton className="h-14 rounded-none border-b" />
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="flex gap-4 border-b p-5 last:border-0"
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-28 md:block" />
        </div>
      ))}
    </div>
  );
}

export function ReservationsEmptyState() {
  return (
    <div className="rounded-2xl border bg-card px-6 py-16 text-center">
      <CalendarX2 className="mx-auto size-12 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">No reservations yet</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Customer reservations will appear here when they are submitted.
      </p>
    </div>
  );
}

export function ReservationsNoResultsState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-card px-6 py-16 text-center">
      <SearchX className="mx-auto size-12 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">No matching reservations</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Try changing or clearing your filters.
      </p>
      <Button className="mt-5" variant="outline" onClick={onReset}>
        Reset filters
      </Button>
    </div>
  );
}

export function ReservationNotFoundState() {
  return (
    <div className="rounded-2xl border bg-card px-6 py-16 text-center">
      <SearchX className="mx-auto size-12 text-muted-foreground" />
      <h1 className="mt-4 text-lg font-semibold">Reservation not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This reservation does not exist or is no longer available.
      </p>
    </div>
  );
}

export function ReservationsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-destructive">
        Could not load reservations
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button className="mt-5" variant="outline" onClick={onRetry}>
        <RefreshCw /> Retry
      </Button>
    </div>
  );
}
