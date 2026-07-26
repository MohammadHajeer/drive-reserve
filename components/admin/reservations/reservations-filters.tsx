"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ReservationStatus } from "@/types/domain";

export type ReservationsFilterState = {
  search: string;
  status: "all" | ReservationStatus;
  customerId: string;
  carId: string;
  dateFrom: string;
  dateTo: string;
};

type Option = {
  label: string;
  value: string;
};

type ReservationsFiltersProps = {
  value: ReservationsFilterState;
  customers: Option[];
  cars: Option[];

  onChange: <K extends keyof ReservationsFilterState>(
    name: K,
    value: ReservationsFilterState[K],
  ) => void;

  onReset: () => void;
};

export function ReservationsFilters({
  value,
  customers,
  cars,
  onChange,
  onReset,
}: ReservationsFiltersProps) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative md:col-span-2 xl:col-span-2">
          <span className="sr-only">Search reservations</span>

          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={value.search}
            onChange={(event) =>
              onChange("search", event.target.value)
            }
            placeholder="Reference, customer, car, plate..."
            className="h-11 rounded-xl pl-10"
          />
        </label>

        <FilterSelect
          value={value.status}
          label="All statuses"
          items={[
            "pending",
            "confirmed",
            "active",
            "completed",
            "cancelled",
            "rejected",
          ].map((status) => ({
            label:
              status.charAt(0).toUpperCase() + status.slice(1),
            value: status,
          }))}
          onChange={(status) =>
            onChange(
              "status",
              status as ReservationsFilterState["status"],
            )
          }
        />

        <FilterSelect
          value={value.customerId}
          label="All customers"
          items={customers}
          onChange={(customerId) =>
            onChange("customerId", customerId)
          }
        />

        <FilterSelect
          value={value.carId}
          label="All cars"
          items={cars}
          onChange={(carId) => onChange("carId", carId)}
        />

        <Input
          type="date"
          aria-label="Pickup date from"
          value={value.dateFrom}
          onChange={(event) =>
            onChange("dateFrom", event.target.value)
          }
          className="h-11 rounded-xl"
        />

        <Input
          type="date"
          aria-label="Return date to"
          value={value.dateTo}
          onChange={(event) =>
            onChange("dateTo", event.target.value)
          }
          className="h-11 rounded-xl"
        />

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl xl:col-start-4"
          onClick={onReset}
        >
          <X className="size-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  label,
  items,
  onChange,
}: {
  value: string;
  label: string;
  items: Option[];
  onChange: (value: string) => void;
}) {
  const options = [
    {
      label,
      value: "all",
    },
    ...items,
  ];

  return (
    <Select<string>
      items={options}
      value={value || "all"}
      onValueChange={(nextValue) => {
        if (nextValue !== null) {
          onChange(nextValue);
        }
      }}
    >
      <SelectTrigger className="h-11 w-full rounded-xl">
        <SelectValue />
      </SelectTrigger>

      <SelectContent
        align="start"
        alignItemWithTrigger={false}
      >
        {options.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
