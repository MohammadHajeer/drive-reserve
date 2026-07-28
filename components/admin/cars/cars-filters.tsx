"use client";

import { ListFilter, RotateCcw, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminCarsSort } from "@/features/admin/cars/admin-car.types";
import type { CarStatus, Transmission } from "@/types/domain";

export type CarsFilterState = {
  search: string;
  status: "all" | CarStatus;
  category: string;
  transmission: "all" | Transmission;
  sort: AdminCarsSort;
};

type CarsFilterName = keyof CarsFilterState;

type CarsFilterChange = <TName extends CarsFilterName>(
  name: TName,
  value: CarsFilterState[TName],
) => void;

type CarsFiltersProps = {
  value: CarsFilterState;
  categories: string[];
  onChange: CarsFilterChange;
  onReset: () => void;
};

const STATUS_OPTIONS: Array<{
  label: string;
  value: CarsFilterState["status"];
}> = [
  { label: "All statuses", value: "all" },
  { label: "Available", value: "available" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Inactive", value: "inactive" },
];

const TRANSMISSION_OPTIONS: Array<{
  label: string;
  value: CarsFilterState["transmission"];
}> = [
  { label: "All transmissions", value: "all" },
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
];

const SORT_OPTIONS: Array<{
  label: string;
  value: AdminCarsSort;
}> = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Newest model year", value: "year-desc" },
  { label: "Brand A–Z", value: "brand-asc" },
];

function formatCategoryLabel(category: string) {
  return category
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function CarsFilters({
  value,
  categories,
  onChange,
  onReset,
}: CarsFiltersProps) {
  const categoryOptions = [
    { label: "All categories", value: "all" },
    ...categories.map((category) => ({
      label: formatCategoryLabel(category),
      value: category,
    })),
  ];

  const hasFilters =
    value.search.trim() !== "" ||
    value.status !== "all" ||
    value.category !== "all" ||
    value.transmission !== "all" ||
    value.sort !== "newest";

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <div className="flex items-start gap-3 border-b bg-muted/30 px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ListFilter className="size-4" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Filter vehicles
          </h2>

          <p className="mt-0.5 text-xs text-muted-foreground">
            Search and refine the vehicle inventory.
          </p>
        </div>
      </div>

      <CardContent className="p-5">
        <fieldset>
          <legend className="sr-only">Vehicle filters</legend>

          <div className="grid gap-x-4 gap-y-5 md:grid-cols-2 xl:grid-cols-12">
            <div className="space-y-2 md:col-span-2 xl:col-span-6">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="admin-cars-search">Search vehicles</Label>

                <span className="text-xs text-muted-foreground">
                  Brand, model, or plate
                </span>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="admin-cars-search"
                  type="search"
                  maxLength={80}
                  value={value.search}
                  onChange={(event) => onChange("search", event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      onChange("search", "");
                    }
                  }}
                  placeholder="Search by brand, model, or plate..."
                  className="pl-9 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
                />

                {value.search.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Clear vehicle search"
                    onClick={() => onChange("search", "")}
                    className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            <FilterSelect
              id="cars-status"
              label="Status"
              items={STATUS_OPTIONS}
              value={value.status}
              onValueChange={(status) => onChange("status", status)}
              className="xl:col-span-3"
            />

            <FilterSelect
              id="cars-category"
              label="Category"
              items={categoryOptions}
              value={value.category}
              onValueChange={(category) => onChange("category", category)}
              className="xl:col-span-3"
            />

            <FilterSelect
              id="cars-transmission"
              label="Transmission"
              items={TRANSMISSION_OPTIONS}
              value={value.transmission}
              onValueChange={(transmission) =>
                onChange("transmission", transmission)
              }
              className="xl:col-span-3"
            />

            <FilterSelect
              id="cars-sort"
              label="Sort by"
              items={SORT_OPTIONS}
              value={value.sort}
              onValueChange={(sort) => onChange("sort", sort)}
              className="xl:col-span-3"
            />

            <div className="flex items-end md:col-span-2 md:justify-end xl:col-span-6">
              <Button
                type="button"
                variant="outline"
                disabled={!hasFilters}
                onClick={onReset}
                className="w-full gap-2 sm:w-auto"
              >
                <RotateCcw className="size-4" />
                Reset filters
              </Button>
            </div>
          </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}

type FilterSelectProps<TValue extends string> = {
  id: string;
  label: string;
  items: Array<{
    label: string;
    value: TValue;
  }>;
  value: TValue;
  onValueChange: (value: TValue) => void;
  className?: string;
};

function FilterSelect<TValue extends string>({
  id,
  label,
  items,
  value,
  onValueChange,
  className,
}: FilterSelectProps<TValue>) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>

      <Select<TValue>
        items={items}
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== null) {
            onValueChange(nextValue);
          }
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>

        <SelectContent align="start" alignItemWithTrigger={false}>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
