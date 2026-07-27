"use client";

import { useEffect, useState } from "react";
import { ListFilter, LoaderCircle, RotateCcw, Search, X } from "lucide-react";

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

const STATUS_OPTIONS: Array<{
  label: string;
  value: ReservationsFilterState["status"];
}> = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Rejected", value: "rejected" },
];

const SORT_OPTIONS: Array<{
  label: string;
  value: AdminReservationsSort;
}> = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Pickup: earliest", value: "pickup-asc" },
  { label: "Pickup: latest", value: "pickup-desc" },
  { label: "Total: low to high", value: "total-asc" },
  { label: "Total: high to low", value: "total-desc" },
];

const PAGE_SIZE_OPTIONS = ADMIN_RESERVATIONS_PAGE_SIZES.map((size) => ({
  label: `${size} per page`,
  value: String(size),
}));

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

  // Synchronize the local input when filters are reset or changed externally.
  useEffect(() => {
    requestAnimationFrame(() => setSearchInput(value.q));
  }, [value.q]);

  useEffect(() => {
    const normalizedInput = normalizeSearch(searchInput);

    if (normalizedInput === normalizeSearch(value.q)) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onChange("q", normalizedInput);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [onChange, searchInput, value.q]);

  function handleReset() {
    setSearchInput("");
    onReset();
  }

  return (
    <Card
      aria-busy={pending}
      className="overflow-hidden border-border/70 shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListFilter className="size-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Filter reservations
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Search and refine the reservation list.
            </p>
          </div>
        </div>

        <div role="status" aria-live="polite" className="min-h-7">
          {pending && (
            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
              <LoaderCircle className="size-3.5 animate-spin" />
              Updating results
            </span>
          )}
        </div>
      </div>

      <CardContent className="p-5">
        <fieldset>
          <legend className="sr-only">Reservation filters</legend>

          <div className="grid gap-x-4 gap-y-5 md:grid-cols-2 xl:grid-cols-12">
            <div className="space-y-2 md:col-span-2 xl:col-span-6">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="reservations-search">Search reservations</Label>

                <span className="text-xs text-muted-foreground">
                  Customer, vehicle, plate, or ID
                </span>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="reservations-search"
                  type="search"
                  maxLength={100}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setSearchInput("");
                    }
                  }}
                  placeholder="Search reservations..."
                  className="pl-9 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
                />

                {searchInput.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Clear reservation search"
                    onClick={() => setSearchInput("")}
                    className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            <FilterSelect
              id="reservations-status"
              label="Status"
              value={value.status}
              items={STATUS_OPTIONS}
              onChange={(status) => onChange("status", status)}
              className="xl:col-span-3"
            />

            <FilterSelect
              id="reservations-sort"
              label="Sort by"
              value={value.sort}
              items={SORT_OPTIONS}
              onChange={(sort) => onChange("sort", sort)}
              className="xl:col-span-3"
            />

            <div className="space-y-2 xl:col-span-3">
              <Label htmlFor="reservations-pickup-from">Pickup from</Label>

              <Input
                id="reservations-pickup-from"
                type="date"
                max={value.pickupTo || undefined}
                value={value.pickupFrom}
                onChange={(event) => onChange("pickupFrom", event.target.value)}
              />
            </div>

            <div className="space-y-2 xl:col-span-3">
              <Label htmlFor="reservations-pickup-to">Pickup to</Label>

              <Input
                id="reservations-pickup-to"
                type="date"
                min={value.pickupFrom || undefined}
                value={value.pickupTo}
                onChange={(event) => onChange("pickupTo", event.target.value)}
              />
            </div>

            <FilterSelect
              id="reservations-page-size"
              label="Results per page"
              value={String(value.limit)}
              items={PAGE_SIZE_OPTIONS}
              onChange={(limit) => onChange("limit", Number(limit))}
              className="xl:col-span-3"
            />

            <div className="flex items-end xl:col-span-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="w-full gap-2"
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
  value: TValue;
  items: Array<{
    label: string;
    value: TValue;
  }>;
  onChange: (value: TValue) => void;
  className?: string;
};

function FilterSelect<TValue extends string>({
  id,
  label,
  value,
  items,
  onChange,
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
            onChange(nextValue);
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
