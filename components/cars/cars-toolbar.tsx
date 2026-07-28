"use client";

import { ArrowUpDown, Grid2X2, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PublicCarSort, PublicCarView } from "@/lib/cars/public-cars";

import { useCarsUrl } from "./use-cars-url";

const sortOptions: { label: string; value: PublicCarSort }[] = [
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest Added", value: "newest" },
  { label: "Newest Model", value: "year-desc" },
  { label: "Brand: A to Z", value: "brand-asc" },
];

export function CarsToolbar({
  sort,
  view,
}: {
  sort: PublicCarSort;
  view: PublicCarView;
}) {
  const { replaceQuery } = useCarsUrl();

  return (
    <div className="flex w-full items-center gap-1 rounded-xl border bg-card p-1 sm:w-auto">
      <Button
        type="button"
        size="icon-sm"
        variant={view === "grid" ? "secondary" : "ghost"}
        aria-label="Grid view"
        aria-pressed={view === "grid"}
        onClick={() => replaceQuery([{ name: "view", values: [] }], false)}
      >
        <Grid2X2 aria-hidden="true" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant={view === "list" ? "secondary" : "ghost"}
        aria-label="List view"
        aria-pressed={view === "list"}
        onClick={() =>
          replaceQuery([{ name: "view", values: ["list"] }], false)
        }
      >
        <List aria-hidden="true" />
      </Button>
      <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
      <ArrowUpDown className="ml-1 size-4 text-muted-foreground" aria-hidden="true" />
      <Select<PublicCarSort>
        items={sortOptions}
        value={sort}
        onValueChange={(value) => {
          if (value === null || value === sort) return;

          replaceQuery([
            {
              name: "sort",
              values: value === "price-asc" ? [] : [value],
            },
          ]);
        }}
      >
        <SelectTrigger
          size="sm"
          aria-label="Sort vehicles"
          className="min-w-0 flex-1 rounded-md border-transparent bg-transparent px-2 text-xs font-medium shadow-none hover:bg-muted focus-visible:ring-2 sm:min-w-48 sm:flex-none sm:text-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          align="end"
          alignItemWithTrigger={false}
          className="rounded-xl"
        >
          {sortOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-lg text-xs sm:text-sm"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
