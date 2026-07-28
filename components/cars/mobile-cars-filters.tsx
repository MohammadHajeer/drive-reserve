"use client";

import { SlidersHorizontal } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type {
  PublicCarsFilters,
  PublicCarsPriceRange,
} from "@/lib/cars/public-cars";
import { cn } from "@/lib/utils";

import { CarsFilterContent } from "./cars-filter-content";

function activeFilterCount(filters: PublicCarsFilters) {
  return (
    (filters.q ? 1 : 0) +
    filters.categories.length +
    filters.transmissions.length +
    filters.fuels.length +
    filters.seatGroups.length +
    (filters.maxPrice === undefined ? 0 : 1)
  );
}

export function MobileCarsFilters({
  filters,
  priceRangePromise,
}: {
  filters: PublicCarsFilters;
  priceRangePromise: Promise<PublicCarsPriceRange>;
}) {
  const count = activeFilterCount(filters);

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger
          className={cn(buttonVariants({ variant: "outline" }), "rounded-lg")}
        >
          <SlidersHorizontal aria-hidden="true" />
          Filters
          {count > 0 && (
            <span className="ml-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </SheetTrigger>
        <SheetContent>
          <div className="mb-6 pr-10">
            <SheetTitle>Vehicle filters</SheetTitle>
            <SheetDescription className="mt-1">
              Refine the available vehicles.
            </SheetDescription>
          </div>
          <CarsFilterContent
            filters={filters}
            priceRangePromise={priceRangePromise}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
