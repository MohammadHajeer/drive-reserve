"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const statusOptions: {
  label: string;
  value: CarsFilterState["status"];
}[] = [
  { label: "All statuses", value: "all" },
  { label: "Available", value: "available" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Inactive", value: "inactive" },
];

const transmissionOptions: {
  label: string;
  value: CarsFilterState["transmission"];
}[] = [
  { label: "All transmissions", value: "all" },
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
];

const sortOptions: { label: string; value: AdminCarsSort }[] = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Newest model year", value: "year-desc" },
  { label: "Brand A–Z", value: "brand-asc" },
];

export function CarsFilters({
  value,
  categories,
  onChange,
  onReset,
}: {
  value: CarsFilterState;
  categories: string[];
  onChange: CarsFilterChange;
  onReset: () => void;
}) {
  const categoryOptions = [
    { label: "All categories", value: "all" },
    ...categories.map((category) => ({ label: category, value: category })),
  ];

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_180px_180px_180px_180px_auto]">
        <label className="relative" htmlFor="admin-cars-search">
          <span className="sr-only">Search cars</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="admin-cars-search"
            type="search"
            maxLength={80}
            value={value.search}
            onChange={(event) => onChange("search", event.target.value)}
            placeholder="Search brand, model, or plate..."
            className="h-11 w-full rounded-xl border bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <FilterSelect
          ariaLabel="Filter by status"
          items={statusOptions}
          value={value.status}
          onValueChange={(nextValue) => onChange("status", nextValue)}
        />

        <FilterSelect
          ariaLabel="Filter by category"
          items={categoryOptions}
          value={value.category}
          onValueChange={(nextValue) => onChange("category", nextValue)}
        />

        <FilterSelect
          ariaLabel="Filter by transmission"
          items={transmissionOptions}
          value={value.transmission}
          onValueChange={(nextValue) => onChange("transmission", nextValue)}
        />

        <FilterSelect
          ariaLabel="Sort cars"
          items={sortOptions}
          value={value.sort}
          onValueChange={(nextValue) => onChange("sort", nextValue)}
        />

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="h-11 rounded-xl px-4 text-slate-600"
        >
          <X className="size-4" /> Reset
        </Button>
      </div>
    </div>
  );
}

function FilterSelect<TValue extends string>({
  ariaLabel,
  items,
  value,
  onValueChange,
}: {
  ariaLabel: string;
  items: { label: string; value: TValue }[];
  value: TValue;
  onValueChange: (value: TValue) => void;
}) {
  return (
    <Select<TValue>
      items={items}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onValueChange(nextValue);
      }}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="h-11 w-full rounded-xl border-border bg-white px-3 text-slate-700"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="rounded-xl"
      >
        {items.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            className="rounded-lg"
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
