import type {
  PublicCarsFilters,
  PublicCarsPriceRange,
} from "@/lib/cars/public-cars";

import { CarsFilterContent } from "./cars-filter-content";

export function CarsFilters({
  filters,
  priceRange,
}: {
  filters: PublicCarsFilters;
  priceRange: PublicCarsPriceRange;
}) {
  return (
    <aside
      className="hidden self-start rounded-xl border bg-card p-5 shadow-sm lg:block"
      aria-label="Vehicle filters"
    >
      <CarsFilterContent
        filters={filters}
        priceRange={priceRange}
        showHeading
      />
    </aside>
  );
}
