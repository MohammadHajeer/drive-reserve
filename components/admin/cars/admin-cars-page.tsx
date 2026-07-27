"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import type {
  AdminCar,
  AdminCarsQuery,
  AdminCarsSort,
} from "@/features/admin/cars/admin-car.types";
import { useAdminCars } from "@/features/admin/cars/hooks/use-admin-cars";
import { useDeleteCar } from "@/features/admin/cars/hooks/use-delete-car";
import { useUpdateCar } from "@/features/admin/cars/hooks/use-update-car";
import { cn } from "@/lib/utils";
import {
  CAR_STATUSES,
  TRANSMISSIONS,
  type CarStatus,
  type Transmission,
} from "@/types/domain";

import { prepareAdminCarListItems } from "./admin-car-list-item";
import { CarsFilters, type CarsFilterState } from "./cars-filters";
import { CarsMobileList } from "./cars-mobile-list";
import { CarsPagination } from "./cars-pagination";
import {
  CarsEmptyState,
  CarsErrorState,
  CarsListLoadingSkeleton,
  CarsNoResultsState,
} from "./cars-states";
import { CarsTable } from "./cars-table";

const SEARCH_DEBOUNCE_MS = 400;

const adminCarsSorts: readonly AdminCarsSort[] = [
  "newest",
  "oldest",
  "price-asc",
  "price-desc",
  "year-desc",
  "brand-asc",
];

function isCarStatus(value: string | null): value is CarStatus {
  return value !== null && CAR_STATUSES.some((status) => status === value);
}

function isTransmission(value: string | null): value is Transmission {
  return (
    value !== null &&
    TRANSMISSIONS.some((transmission) => transmission === value)
  );
}

function isAdminCarsSort(value: string | null): value is AdminCarsSort {
  return value !== null && adminCarsSorts.some((sort) => sort === value);
}

function parsePage(value: string | null) {
  if (value === null) {
    return 1;
  }

  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function normalizeSearch(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function AdminCarsPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [busyCarId, setBusyCarId] = useState<string>();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );

  const { filters, page } = useMemo(() => {
    const status = searchParams.get("status");
    const transmission = searchParams.get("transmission");
    const sort = searchParams.get("sort");
    const category = searchParams.get("category")?.trim();

    return {
      filters: {
        search: searchParams.get("search") ?? "",
        status: isCarStatus(status) ? status : "all",
        category: category || "all",
        transmission: isTransmission(transmission) ? transmission : "all",
        sort: isAdminCarsSort(sort) ? sort : "newest",
      } satisfies CarsFilterState,

      page: parsePage(searchParams.get("page")),
    };
  }, [searchParams]);

  const replaceSearchParams = useCallback(
    (nextParams: URLSearchParams) => {
      const queryString = nextParams.toString();

      window.history.replaceState(
        null,
        "",
        queryString ? `${pathname}?${queryString}` : pathname,
      );
    },
    [pathname],
  );

  // Keep the input synchronized with URL changes such as reset,
  // browser navigation, or an external filter update.
  useEffect(() => {
    requestAnimationFrame(() => setSearchInput(filters.search));
  }, [filters.search]);

  // Update the URL and fetch results only after the user pauses typing.
  useEffect(() => {
    const normalizedInput = normalizeSearch(searchInput);
    const normalizedUrlSearch = normalizeSearch(filters.search);

    if (normalizedInput === normalizedUrlSearch) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString());

      if (normalizedInput) {
        nextParams.set("search", normalizedInput);
      } else {
        nextParams.delete("search");
      }

      nextParams.set("page", "1");
      replaceSearchParams(nextParams);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [filters.search, replaceSearchParams, searchInput, searchParams]);

  const carsQuery = useMemo<AdminCarsQuery>(
    () => ({
      search: filters.search.trim() || undefined,
      status: filters.status === "all" ? undefined : filters.status,
      category: filters.category === "all" ? undefined : filters.category,
      transmission:
        filters.transmission === "all" ? undefined : filters.transmission,
      sort: filters.sort,
      page,
      limit: 10,
    }),
    [filters, page],
  );

  const query = useAdminCars(carsQuery);
  const deactivateMutation = useDeleteCar();
  const updateMutation = useUpdateCar();

  const cars = useMemo(() => query.data?.cars ?? [], [query.data?.cars]);

  const listItems = useMemo(() => prepareAdminCarListItems(cars), [cars]);

  const categories = useMemo(() => {
    const values = cars.map((car) => car.category).filter(Boolean);

    if (filters.category !== "all") {
      values.push(filters.category);
    }

    return Array.from(new Set(values)).sort((first, second) =>
      first.localeCompare(second),
    );
  }, [cars, filters.category]);

  const hasActiveFilters =
    searchInput.trim() !== "" ||
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.transmission !== "all" ||
    filters.sort !== "newest";

  function changeFilter<TName extends keyof CarsFilterState>(
    name: TName,
    value: CarsFilterState[TName],
  ) {
    const nextParams = new URLSearchParams(searchParams.toString());

    const stringValue = String(value);

    const isDefaultValue =
      stringValue === "" ||
      stringValue === "all" ||
      (name === "sort" && stringValue === "newest");

    if (isDefaultValue) {
      nextParams.delete(name);
    } else {
      nextParams.set(name, stringValue);
    }

    nextParams.set("page", "1");
    replaceSearchParams(nextParams);
  }

  function handleFilterChange<TName extends keyof CarsFilterState>(
    name: TName,
    value: CarsFilterState[TName],
  ) {
    if (name === "search") {
      setSearchInput(String(value));
      return;
    }

    changeFilter(name, value);
  }

  function resetFilters() {
    // Clear the visible search input immediately.
    setSearchInput("");

    const nextParams = new URLSearchParams(searchParams.toString());

    for (const name of [
      "search",
      "status",
      "category",
      "transmission",
      "sort",
    ]) {
      nextParams.delete(name);
    }

    nextParams.set("page", "1");
    replaceSearchParams(nextParams);
  }

  function changePage(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.set("page", String(Math.max(1, nextPage)));

    replaceSearchParams(nextParams);
  }

  async function deactivateCar(car: AdminCar) {
    if (
      !window.confirm(
        `Deactivate ${car.brand} ${car.model}? It will remain stored but will no longer be available to customers.`,
      )
    ) {
      return;
    }

    setBusyCarId(car.id);

    try {
      await deactivateMutation.mutateAsync(car.id);
      toast.success("Car deactivated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to deactivate the car.",
      );
    } finally {
      setBusyCarId(undefined);
    }
  }

  async function restoreCar(car: AdminCar) {
    setBusyCarId(car.id);

    try {
      await updateMutation.mutateAsync({
        carId: car.id,
        input: {
          status: "available",
        },
      });

      toast.success("Car restored successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to restore the car.",
      );
    } finally {
      setBusyCarId(undefined);
    }
  }

  const total = query.data?.pagination.total ?? 0;

  const available = cars.filter((car) => car.status === "available").length;

  const maintenance = cars.filter((car) => car.status === "maintenance").length;

  const inactive = cars.filter((car) => car.status === "inactive").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Fleet operations
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Car Management
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Search, review, update, and safely deactivate every vehicle in the
            fleet.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 rounded-xl bg-white font-semibold"
          >
            <Download className="size-4" />
            Export CSV
          </Button>

          <Link
            href="/admin/cars/new"
            className={cn(
              buttonVariants({
                size: "lg",
              }),
              "h-11 rounded-xl bg-blue-600 font-semibold hover:bg-blue-700",
            )}
          >
            <Plus className="size-4" />
            Add New Car
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Matching fleet",
            value: total,
          },
          {
            label: "Available on page",
            value: available,
          },
          {
            label: "Maintenance on page",
            value: maintenance,
          },
          {
            label: "Inactive on page",
            value: inactive,
          },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {query.isPending ? "—" : item.value}
            </p>
          </article>
        ))}
      </div>

      <CarsFilters
        value={{
          ...filters,
          search: searchInput,
        }}
        categories={categories}
        onChange={handleFilterChange}
        onReset={resetFilters}
      />

      {query.isPending ? (
        <CarsListLoadingSkeleton />
      ) : query.isError ? (
        <CarsErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : "An unexpected error occurred."
          }
          onRetry={() => query.refetch()}
        />
      ) : listItems.length === 0 ? (
        hasActiveFilters || total > 0 || page > 1 ? (
          <CarsNoResultsState onReset={resetFilters} />
        ) : (
          <CarsEmptyState />
        )
      ) : (
        <div>
          <CarsTable
            items={listItems}
            busyCarId={busyCarId}
            onDeactivate={deactivateCar}
            onRestore={restoreCar}
          />

          <CarsMobileList
            items={listItems}
            busyCarId={busyCarId}
            onDeactivate={deactivateCar}
            onRestore={restoreCar}
          />

          {query.data && (
            <div className="mt-3 overflow-hidden rounded-2xl border md:mt-0 md:rounded-t-none md:border-t-0">
              <CarsPagination
                pagination={query.data.pagination}
                onPageChange={changePage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
