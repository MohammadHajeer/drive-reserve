"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  useEffect(() => {
    const normalizedInput = normalizeSearch(searchInput);
    if (normalizedInput === normalizeSearch(value.q)) return;

    const timeout = window.setTimeout(() => {
      onChange("q", normalizedInput);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [onChange, searchInput, value.q]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Filters</p>
          {pending && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <LoaderCircle className="size-3.5 animate-spin" /> Updating
            </span>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative md:col-span-2">
            <span className="sr-only">Search customers</span>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              maxLength={100}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or phone..."
              className="pl-9"
            />
          </label>

          <Select<AdminCustomersSort>
            items={[
              { label: "Newest first", value: "newest" },
              { label: "Oldest first", value: "oldest" },
            ]}
            value={value.sort}
            onValueChange={(sort) => {
              if (sort !== null) onChange("sort", sort);
            }}
          >
            <SelectTrigger aria-label="Sort customers">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>

          <Select<string>
            items={ADMIN_CUSTOMERS_PAGE_SIZES.map((size) => ({
              label: `${size} per page`,
              value: String(size),
            }))}
            value={String(value.limit)}
            onValueChange={(limit) => {
              if (limit !== null) onChange("limit", Number(limit));
            }}
          >
            <SelectTrigger aria-label="Customers per page">
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

          <Input
            type="date"
            aria-label="Joined from"
            value={value.joinedFrom}
            onChange={(event) => onChange("joinedFrom", event.target.value)}
          />
          <Input
            type="date"
            aria-label="Joined to"
            min={value.joinedFrom || undefined}
            value={value.joinedTo}
            onChange={(event) => onChange("joinedTo", event.target.value)}
          />
          {hasFilters && (
            <div className="md:col-span-2 xl:flex xl:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                className="w-full gap-2 xl:w-auto"
              >
                <RotateCcw className="size-4" />
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
