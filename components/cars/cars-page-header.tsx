import type { PublicCarsFilters } from "@/lib/cars/public-cars";

import { CarsToolbar } from "./cars-toolbar";

export function CarsPageHeader({ filters }: { filters: PublicCarsFilters }) {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Available Vehicles
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Browse our available fleet and find the right vehicle for your next journey.
        </p>
      </div>
      <CarsToolbar sort={filters.sort} view={filters.view} />
    </header>
  );
}
