import Link from "next/link";
import { CarFront, RefreshCw, SearchX } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CarsListLoadingSkeleton() {
  return (
    <>
      <div className="space-y-3 md:hidden" aria-label="Loading cars">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border bg-card"
          >
            <div className="h-44 animate-pulse bg-muted" />
            <div className="space-y-4 p-4">
              <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-9 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </div>
      <div
        className="hidden overflow-hidden rounded-2xl border bg-card md:block"
        aria-label="Loading cars"
      >
        <div className="h-14 animate-pulse border-b bg-muted" />
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b p-4 last:border-b-0"
          >
            <div className="h-14 w-20 animate-pulse rounded-xl bg-muted" />
            <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="hidden h-4 w-20 animate-pulse rounded bg-muted lg:block" />
          </div>
        ))}
      </div>
    </>
  );
}

export function CarsLoadingSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="h-14 animate-pulse border-b bg-muted" />
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b p-4 last:border-b-0"
        >
          <div className="h-14 w-20 animate-pulse rounded-xl bg-muted" />
          <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
          <div className="hidden h-4 w-24 animate-pulse rounded bg-muted md:block" />
          <div className="hidden h-4 w-20 animate-pulse rounded bg-muted lg:block" />
        </div>
      ))}
    </div>
  );
}

export function CarsEmptyState() {
  return (
    <div className="rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
        <CarFront />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Your fleet is empty
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Add your first vehicle to start managing availability and pricing.
      </p>
      <Link
        href="/admin/cars/new"
        className={cn(
          buttonVariants(),
          "mt-5 rounded-xl bg-blue-600 hover:bg-blue-700",
        )}
      >
        Add your first car
      </Link>
    </div>
  );
}

export function CarsNoResultsState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <SearchX />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        No matching cars
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Try a different search or clear the filters to see the full fleet.
      </p>
      <Button
        type="button"
        className="mt-5 rounded-xl"
        variant="outline"
        onClick={onReset}
      >
        Reset filters
      </Button>
    </div>
  );
}

export function CarsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-destructive">
        Could not load the fleet
      </h2>
      <p className="mt-2 text-sm text-destructive/90">{message}</p>
      <Button
        className="mt-5"
        variant="outline"
        onClick={onRetry}
      >
        <RefreshCw /> Retry
      </Button>
    </div>
  );
}
