"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ADMIN_CUSTOMERS_DEFAULTS,
  ADMIN_CUSTOMERS_PAGE_SIZES,
  type AdminCustomersQuery,
  type AdminCustomersSort,
} from "@/features/admin/customers/admin-customer.types";
import { useAdminCustomers } from "@/features/admin/customers/hooks/use-admin-customers";
import { cn } from "@/lib/utils";

import { CustomerCard } from "./customer-card";
import { CustomersTable } from "./customers-table";
import { CustomerSummaryCards } from "./customer-summary-cards";
import {
  CustomersFilters,
  type CustomersFilterState,
} from "./customers-filters";
import { CustomersPagination } from "./customers-pagination";
import {
  CustomersEmptyState,
  CustomersErrorState,
  CustomersLoadingSkeleton,
  CustomersNoResultsState,
} from "./customers-states";
import { useAdminCustomersUrl } from "./use-admin-customers-url";

type CustomersView = "table" | "cards";

function parsePositiveInteger(value: string | null, fallback: number) {
  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function parseLimit(value: string | null) {
  const limit = parsePositiveInteger(
    value,
    ADMIN_CUSTOMERS_DEFAULTS.limit,
  );

  return ADMIN_CUSTOMERS_PAGE_SIZES.some((size) => size === limit)
    ? limit
    : ADMIN_CUSTOMERS_DEFAULTS.limit;
}

function parseSort(value: string | null): AdminCustomersSort {
  return value === "oldest"
    ? "oldest"
    : ADMIN_CUSTOMERS_DEFAULTS.sort;
}

function parseView(value: string | null): CustomersView {
  return value === "cards" ? "cards" : "table";
}

export function AdminCustomersPage() {
  const searchParams = useSearchParams();
  const {
    isPending: isUrlPending,
    replaceQuery,
  } = useAdminCustomersUrl();

  const legacySearch = searchParams.get("search");
  const view = parseView(searchParams.get("view"));

  const filters = useMemo<CustomersFilterState>(
    () => ({
      q: searchParams.get("q") ?? legacySearch ?? "",
      sort: parseSort(searchParams.get("sort")),
      joinedFrom: searchParams.get("joinedFrom") ?? "",
      joinedTo: searchParams.get("joinedTo") ?? "",
      limit: parseLimit(searchParams.get("limit")),
    }),
    [legacySearch, searchParams],
  );

  const rawPage = searchParams.get("page");

  const page = parsePositiveInteger(
    rawPage,
    ADMIN_CUSTOMERS_DEFAULTS.page,
  );

  const queryInput = useMemo<AdminCustomersQuery>(
    () => ({
      q: filters.q || undefined,
      sort: filters.sort,
      joinedFrom: filters.joinedFrom || undefined,
      joinedTo: filters.joinedTo || undefined,
      page,
      limit: filters.limit,
    }),
    [filters, page],
  );

  const query = useAdminCustomers(queryInput);
  const customers = query.data?.customers ?? [];

  const isUpdatingResults =
    isUrlPending || query.isFetching;

  const hasFilters =
    filters.q.trim() !== "" ||
    filters.sort !== ADMIN_CUSTOMERS_DEFAULTS.sort ||
    filters.joinedFrom !== "" ||
    filters.joinedTo !== "" ||
    filters.limit !== ADMIN_CUSTOMERS_DEFAULTS.limit;

  const changeFilter = useCallback(
    <K extends keyof CustomersFilterState>(
      name: K,
      value: CustomersFilterState[K],
    ) => {
      let urlValue: string | undefined = String(value);

      if (
        urlValue === "" ||
        (name === "sort" &&
          urlValue === ADMIN_CUSTOMERS_DEFAULTS.sort) ||
        (name === "limit" &&
          Number(value) === ADMIN_CUSTOMERS_DEFAULTS.limit)
      ) {
        urlValue = undefined;
      }

      replaceQuery([{ name, value: urlValue }]);
    },
    [replaceQuery],
  );

  const changeView = useCallback(
    (nextView: CustomersView) => {
      replaceQuery(
        [
          {
            name: "view",
            // Table is the default, so it does not need a URL parameter.
            value: nextView === "cards" ? "cards" : undefined,
          },
        ],
        false,
      );
    },
    [replaceQuery],
  );

  const resetFilters = useCallback(() => {
    replaceQuery(
      [
        "q",
        "search",
        "status",
        "sort",
        "joinedFrom",
        "joinedTo",
        "limit",
      ].map((name) => ({ name })),
    );
  }, [replaceQuery]);

  const changePage = useCallback(
    (nextPage: number) => {
      const normalizedPage = Math.max(1, nextPage);

      replaceQuery(
        [
          {
            name: "page",
            value:
              normalizedPage === ADMIN_CUSTOMERS_DEFAULTS.page
                ? undefined
                : String(normalizedPage),
          },
        ],
        false,
      );
    },
    [replaceQuery],
  );

  useEffect(() => {
    const updates: Array<{
      name: string;
      value?: string;
    }> = [];

    if (searchParams.has("search")) {
      updates.push({ name: "search" });

      if (!searchParams.has("q") && legacySearch?.trim()) {
        updates.push({
          name: "q",
          value: legacySearch,
        });
      }
    }

    if (searchParams.has("status")) {
      updates.push({ name: "status" });
    }

    if (updates.length > 0) {
      replaceQuery(updates);
    }
  }, [legacySearch, replaceQuery, searchParams]);

  useEffect(() => {
    const canonicalPage =
      page === ADMIN_CUSTOMERS_DEFAULTS.page
        ? null
        : String(page);

    if (rawPage !== canonicalPage) {
      changePage(page);
    }
  }, [changePage, page, rawPage]);

  useEffect(() => {
    if (!query.data || query.isPlaceholderData) {
      return;
    }

    const lastValidPage = Math.max(
      query.data.pagination.totalPages,
      1,
    );

    if (page > lastValidPage) {
      changePage(lastValidPage);
    }
  }, [
    changePage,
    page,
    query.data,
    query.isPlaceholderData,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">
          Customer operations
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Customers
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
          Explore customer profiles and review their reservation
          activity.
        </p>
      </div>

      {query.data && (
        <CustomerSummaryCards summary={query.data.summary} />
      )}

      <CustomersFilters
        value={filters}
        pending={isUpdatingResults}
        hasFilters={hasFilters}
        onChange={changeFilter}
        onReset={resetFilters}
      />

      {query.isError && query.data && (
        <CustomersErrorState
          compact
          message={query.error.message}
          onRetry={() => query.refetch()}
        />
      )}

      {query.isLoading && !query.data ? (
        <CustomersLoadingSkeleton />
      ) : query.isError && !query.data ? (
        <CustomersErrorState
          message={query.error.message}
          onRetry={() => query.refetch()}
        />
      ) : customers.length === 0 ? (
        hasFilters || page > 1 ? (
          <CustomersNoResultsState onReset={resetFilters} />
        ) : (
          <CustomersEmptyState />
        )
      ) : (
        <div
          aria-busy={isUpdatingResults}
          className={cn(
            "space-y-4 transition-opacity",
            isUpdatingResults && "opacity-70",
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">
                Customer list
              </h2>

              <p className="text-sm text-muted-foreground">
                {query.data?.pagination.totalItems ?? customers.length}{" "}
                customers found
              </p>
            </div>

            <div
              role="group"
              aria-label="Customer display layout"
              className="inline-flex w-fit items-center rounded-lg border bg-muted/30 p-1"
            >
              <Button
                type="button"
                size="sm"
                variant={view === "table" ? "default" : "ghost"}
                aria-pressed={view === "table"}
                onClick={() => changeView("table")}
                className="h-8 gap-2 px-3"
              >
                <List className="size-4" />
                Table
              </Button>

              <Button
                type="button"
                size="sm"
                variant={view === "cards" ? "default" : "ghost"}
                aria-pressed={view === "cards"}
                onClick={() => changeView("cards")}
                className="h-8 gap-2 px-3"
              >
                <LayoutGrid className="size-4" />
                Cards
              </Button>
            </div>
          </div>

          {view === "table" ? (
            <CustomersTable customers={customers} />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                />
              ))}
            </div>
          )}

          {query.data && (
            <CustomersPagination
              pagination={query.data.pagination}
              pending={isUpdatingResults}
              onPageChange={changePage}
            />
          )}
        </div>
      )}
    </div>
  );
}