"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ListFilter,
  LoaderCircle,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

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
  ADMIN_CUSTOMERS_PAGE_SIZES,
  type AdminCustomersSort,
} from "@/features/admin/customers/admin-customer.types";

export type CustomersFilterState = {
  q: string;
  sort: AdminCustomersSort;
  joinedFrom: string;
  joinedTo: string;
  limit: number;
};

type CustomersFiltersProps = {
  value: CustomersFilterState;
  pending: boolean;
  hasFilters: boolean;
  onChange: <K extends keyof CustomersFilterState>(
    key: K,
    value: CustomersFilterState[K],
  ) => void;
  onReset: () => void;
};

const SORT_OPTIONS: Array<{
  label: string;
  value: AdminCustomersSort;
}> = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
];

const PAGE_SIZE_OPTIONS = ADMIN_CUSTOMERS_PAGE_SIZES.map((size) => ({
  label: `${size} per page`,
  value: String(size),
}));

function normalizeSearch(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function CustomersFilters({
  value,
  pending,
  hasFilters,
  onChange,
  onReset,
}: CustomersFiltersProps) {
  const [searchInput, setSearchInput] = useState(value.q);

  // Keep the local input synchronized with URL/filter state.
  // This is important when filters are reset externally.
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

  const canReset = hasFilters || normalizeSearch(searchInput).length > 0;

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
            <ListFilter className="size-4.5" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Filter customers
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Search and refine the customer list.
            </p>
          </div>
        </div>

        <div role="status" aria-live="polite" className="min-h-7">
          {pending ? (
            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
              <LoaderCircle className="size-3.5 animate-spin" />
              Updating results
            </span>
          ) : hasFilters ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <CheckCircle2 className="size-3.5" />
              Filters applied
            </span>
          ) : null}
        </div>
      </div>

      <CardContent className="p-5">
        <div className="grid gap-x-4 gap-y-5 md:grid-cols-2 xl:grid-cols-12">
          <div className="space-y-2 md:col-span-2 xl:col-span-6">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="customers-search">Search customers</Label>

              <span className="text-xs text-muted-foreground">
                Name or phone number
              </span>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="customers-search"
                type="search"
                maxLength={100}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearchInput("");
                  }
                }}
                placeholder="Search by name or phone..."
                className="pl-9 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
              />

              {searchInput.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Clear customer search"
                  onClick={() => setSearchInput("")}
                  className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 xl:col-span-3">
            <Label htmlFor="customers-sort">Sort by</Label>

            <Select<AdminCustomersSort>
              items={SORT_OPTIONS}
              value={value.sort}
              onValueChange={(sort) => {
                if (sort !== null) {
                  onChange("sort", sort);
                }
              }}
            >
              <SelectTrigger id="customers-sort" className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent align="start" alignItemWithTrigger={false}>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 xl:col-span-3">
            <Label htmlFor="customers-page-size">Results per page</Label>

            <Select<string>
              items={PAGE_SIZE_OPTIONS}
              value={String(value.limit)}
              onValueChange={(limit) => {
                if (limit !== null) {
                  onChange("limit", Number(limit));
                }
              }}
            >
              <SelectTrigger id="customers-page-size" className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent align="start" alignItemWithTrigger={false}>
                {ADMIN_CUSTOMERS_PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 xl:col-span-3">
            <Label htmlFor="customers-joined-from">Joined from</Label>

            <Input
              id="customers-joined-from"
              type="date"
              max={value.joinedTo || undefined}
              value={value.joinedFrom}
              onChange={(event) => onChange("joinedFrom", event.target.value)}
            />
          </div>

          <div className="space-y-2 xl:col-span-3">
            <Label htmlFor="customers-joined-to">Joined to</Label>

            <Input
              id="customers-joined-to"
              type="date"
              min={value.joinedFrom || undefined}
              value={value.joinedTo}
              onChange={(event) => onChange("joinedTo", event.target.value)}
            />
          </div>

          <div className="flex items-end md:col-span-2 md:justify-end xl:col-span-6">
            <Button
              type="button"
              variant="outline"
              disabled={!canReset}
              onClick={handleReset}
              className="w-full gap-2 sm:w-auto"
            >
              <RotateCcw className="size-4" />
              Reset filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
