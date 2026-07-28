import { CarFront } from "lucide-react";

import type {
  PublicCarListItem,
  PublicCarsPagination,
  PublicCarView,
} from "@/lib/cars/public-cars";
import { cn } from "@/lib/utils";

import { CarsPagination } from "./cars-pagination";
import { ClearCarsFilters } from "./clear-cars-filters";
import { CarCard } from "./car-card";

export function CarsResults({
  cars,
  pagination,
  view,
  errorMessage,
}: {
  cars: PublicCarListItem[];
  pagination: PublicCarsPagination;
  view: PublicCarView;
  errorMessage?: string;
}) {
  if (errorMessage) {
    return (
      <div role="alert" className="rounded-xl border bg-card p-8 text-center">
        <CarFront
          className="mx-auto size-9 text-muted-foreground"
          aria-hidden="true"
        />
        <h2 className="mt-3 font-semibold">Vehicles could not be loaded</h2>
        <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <CarFront
          className="mx-auto size-10 text-muted-foreground"
          aria-hidden="true"
        />
        <h2 className="mt-4 text-lg font-semibold">No vehicles found</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Try a broader search or clear the selected filters to see more
          vehicles.
        </p>
        <ClearCarsFilters />
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "grid min-w-0 gap-4",
          view === "grid" && "sm:grid-cols-2 xl:grid-cols-3",
          view === "list" && "grid-cols-1",
        )}
      >
        {cars.map((car) => (
          <CarCard key={car.id} car={car} view={view} />
        ))}
      </div>
      <CarsPagination pagination={pagination} />
    </>
  );
}
