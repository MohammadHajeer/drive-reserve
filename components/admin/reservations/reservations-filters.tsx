"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ADMIN_RESERVATIONS_PAGE_SIZES,
  type AdminReservationsSort,
} from "@/features/admin/reservations/admin-reservation.types";
import type { ReservationStatus } from "@/types/domain";

export type ReservationsFilterState = {
  q: string;
  status: "all" | ReservationStatus;
  pickupFrom: string;
  pickupTo: string;
  sort: AdminReservationsSort;
  limit: number;
};

type ReservationsFiltersProps = {
  value: ReservationsFilterState;
  pending: boolean;
  onChange: <K extends keyof ReservationsFilterState>(
    name: K,
    value: ReservationsFilterState[K],
  ) => void;
  onReset: () => void;
};

const statusOptions: { label: string; value: ReservationsFilterState["status"] }[] = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Rejected", value: "rejected" },
];

const sortOptions: { label: string; value: AdminReservationsSort }[] = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Pickup: earliest", value: "pickup-asc" },
  { label: "Pickup: latest", value: "pickup-desc" },
  { label: "Total: low to high", value: "total-asc" },
  { label: "Total: high to low", value: "total-desc" },
];

function normalizeSearch(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function ReservationsFilters({
  value,
  pending,
  onChange,
  onReset,
}: ReservationsFiltersProps) {
  const [searchInput, setSearchInput] = useState(value.q);

  useEffect(() => {
    const normalizedInput = normalizeSearch(searchInput);
    if (normalizedInput === normalizeSearch(value.q)) return;

    const timeout = window.setTimeout(() => {
      onChange("q", normalizedInput);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [onChange, searchInput, value.q]);

  return (
    <fieldset
      aria-busy={pending}
      className="rounded-2xl border bg-card p-4 shadow-sm"
    >
      <legend className="sr-only">Reservation filters</legend>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Filters</p>
        {pending && (
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <LoaderCircle className="size-3.5 animate-spin" /> Updating
          </span>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative md:col-span-2">
          <span className="sr-only">Search reservations</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            maxLength={100}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Reservation ID, customer, car, or plate..."
            className="h-11 rounded-xl pl-10"
          />
        </label>

        <FilterSelect
          ariaLabel="Filter reservations by status"
          value={value.status}
          items={statusOptions}
          onChange={(status) => onChange("status", status)}
        />
        <FilterSelect
          ariaLabel="Sort reservations"
          value={value.sort}
          items={sortOptions}
          onChange={(sort) => onChange("sort", sort)}
        />

        <Input
          type="date"
          aria-label="Pickup date from"
          value={value.pickupFrom}
          onChange={(event) => onChange("pickupFrom", event.target.value)}
          className="h-11 rounded-xl"
        />
        <Input
          type="date"
          aria-label="Pickup date to"
          min={value.pickupFrom || undefined}
          value={value.pickupTo}
          onChange={(event) => onChange("pickupTo", event.target.value)}
          className="h-11 rounded-xl"
        />
        <FilterSelect
          ariaLabel="Reservations per page"
          value={String(value.limit)}
          items={ADMIN_RESERVATIONS_PAGE_SIZES.map((size) => ({
            label: `${size} per page`,
            value: String(size),
          }))}
          onChange={(limit) => onChange("limit", Number(limit))}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl"
          onClick={onReset}
        >
          <X className="size-4" /> Reset
        </Button>
      </div>
    </fieldset>
  );
}

function FilterSelect<TValue extends string>({
  ariaLabel,
  value,
  items,
  onChange,
}: {
  ariaLabel: string;
  value: TValue;
  items: { label: string; value: TValue }[];
  onChange: (value: TValue) => void;
}) {
  return (
    <Select<TValue>
      items={items}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onChange(nextValue);
      }}
    >
      <SelectTrigger aria-label={ariaLabel} className="h-11 w-full rounded-xl">
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
  );
}
