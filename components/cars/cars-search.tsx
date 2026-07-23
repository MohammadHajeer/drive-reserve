"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import { useCarsUrl } from "./use-cars-url";

function normalizeSearchValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function CarsSearch({
  q,
  total,
  mobileFilters,
}: {
  q: string;
  total: number;
  mobileFilters: ReactNode;
}) {
  const [searchValue, setSearchValue] = useState(q);
  const { replaceQuery } = useCarsUrl();

  useEffect(() => {
    const normalizedValue = normalizeSearchValue(searchValue);
    const normalizedQuery = normalizeSearchValue(q);

    if (normalizedValue === normalizedQuery) {
      return;
    }

    const timeout = window.setTimeout(() => {
      replaceQuery([
        { name: "q", values: normalizedValue ? [normalizedValue] : [] },
      ]);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [q, replaceQuery, searchValue]);

  useEffect(() => {
    function syncSearchFromHistory() {
      const historyQuery = new URLSearchParams(window.location.search).get("q") ?? "";
      setSearchValue(normalizeSearchValue(historyQuery));
    }

    window.addEventListener("popstate", syncSearchFromHistory);
    return () => window.removeEventListener("popstate", syncSearchFromHistory);
  }, []);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <div className="relative min-w-0 flex-1 basis-64">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor="cars-search" className="sr-only">
          Search vehicles
        </label>
        <Input
          id="cars-search"
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search by brand, model, or category..."
          className="h-10 rounded-lg border-border bg-card pl-9"
        />
      </div>
      {mobileFilters}
      <p className="shrink-0 text-xs text-muted-foreground" aria-live="polite">
        {total} {total === 1 ? "vehicle" : "vehicles"}
      </p>
    </div>
  );
}
