import type {
  PublicCarsFilters,
  PublicCarsPriceRange,
} from "@/lib/cars/public-cars";

import { CarsFilterContent } from "./cars-filter-content";

export function CarsFilters({
  filters,
  priceRangePromise,
}: {
  filters: PublicCarsFilters;
  priceRangePromise: Promise<PublicCarsPriceRange>;
}) {
  return (
    <aside
      className="hidden self-start rounded-xl border bg-card p-5 shadow-sm lg:block"
      aria-label="Vehicle filters"
    >
      <CarsFilterContent
        filters={filters}
        priceRangePromise={priceRangePromise}
        showHeading
      />
    </aside>
  );
}
