"use client";

import { Button } from "@/components/ui/button";

import { useCarsUrl } from "./use-cars-url";

const filterNames = [
  "q",
  "category",
  "transmission",
  "fuel",
  "seats",
  "maxPrice",
] as const;

export function ClearCarsFilters() {
  const { replaceQuery } = useCarsUrl();

  return (
    <Button
      type="button"
      className="mt-5 rounded-lg"
      onClick={() =>
        replaceQuery(filterNames.map((name) => ({ name, values: [] })))
      }
    >
      Clear filters
    </Button>
  );
}
