"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import type {
  AdminReservation,
  AdminReservationsQuery,
  AdminReservationsSort,
} from "@/features/admin/reservations/admin-reservation.types";
import {
  ADMIN_RESERVATIONS_DEFAULTS,
  ADMIN_RESERVATIONS_PAGE_SIZES,
} from "@/features/admin/reservations/admin-reservation.types";
import { useAdminReservations } from "@/features/admin/reservations/hooks/use-admin-reservations";
import { useUpdateAdminReservationStatus } from "@/features/admin/reservations/hooks/use-update-admin-reservation-status";
import type { ReservationStatus } from "@/types/domain";
import { RESERVATION_STATUSES } from "@/types/domain";

import { ReservationActionDialog } from "./reservation-action-dialog";
import { ReservationSummaryCards } from "./reservation-summary-cards";
import {
  ReservationsFilters,
  type ReservationsFilterState,
} from "./reservations-filters";
import { ReservationsMobileList } from "./reservations-mobile-list";
import { ReservationsPagination } from "./reservations-pagination";
import {
  ReservationsEmptyState,
  ReservationsErrorState,
  ReservationsLoadingSkeleton,
  ReservationsNoResultsState,
} from "./reservations-states";
import { ReservationsTable } from "./reservations-table";
import { useAdminReservationsUrl } from "./use-admin-reservations-url";

const sorts: readonly AdminReservationsSort[] = [
  "newest",
  "oldest",
  "pickup-asc",
  "pickup-desc",
  "total-asc",
  "total-desc",
];

function isStatus(value: string | null): value is ReservationStatus {
  return (
    value !== null &&
    RESERVATION_STATUSES.includes(value as ReservationStatus)
  );
}

function isSort(value: string | null): value is AdminReservationsSort {
  return value !== null && sorts.includes(value as AdminReservationsSort);
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function parseLimit(value: string | null) {
  const limit = parsePositiveInteger(
    value,
    ADMIN_RESERVATIONS_DEFAULTS.limit,
  );
  return ADMIN_RESERVATIONS_PAGE_SIZES.some((size) => size === limit)
    ? limit
    : ADMIN_RESERVATIONS_DEFAULTS.limit;
}

export function AdminReservationsPage() {
  const searchParams = useSearchParams();
  const { isPending: isUrlPending, replaceQuery } =
    useAdminReservationsUrl();
  const [selected, setSelected] = useState<AdminReservation>();
  const [targetStatus, setTargetStatus] = useState<
    Exclude<ReservationStatus, "pending">
  >("confirmed");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filters = useMemo<ReservationsFilterState>(() => {
    const status = searchParams.get("status");
    const sort = searchParams.get("sort");
    return {
      q: searchParams.get("q") ?? "",
      status: isStatus(status) ? status : "all",
      pickupFrom: searchParams.get("pickupFrom") ?? "",
      pickupTo: searchParams.get("pickupTo") ?? "",
      sort: isSort(sort) ? sort : ADMIN_RESERVATIONS_DEFAULTS.sort,
      limit: parseLimit(searchParams.get("limit")),
    };
  }, [searchParams]);
  const page = parsePositiveInteger(
    searchParams.get("page"),
    ADMIN_RESERVATIONS_DEFAULTS.page,
  );
  const queryInput = useMemo<AdminReservationsQuery>(
    () => ({
      q: filters.q || undefined,
      status: filters.status === "all" ? undefined : filters.status,
      pickupFrom: filters.pickupFrom || undefined,
      pickupTo: filters.pickupTo || undefined,
      sort: filters.sort,
      page,
      limit: filters.limit,
    }),
    [filters, page],
  );
  const query = useAdminReservations(queryInput);
  const mutation = useUpdateAdminReservationStatus();
  const reservations = query.data?.reservations ?? [];
  const isUpdatingResults = isUrlPending || query.isFetching;
  const hasFilters =
    filters.q.trim() !== "" ||
    filters.status !== "all" ||
    filters.pickupFrom !== "" ||
    filters.pickupTo !== "";

  const changeFilter = useCallback(
    <K extends keyof ReservationsFilterState>(
      name: K,
      value: ReservationsFilterState[K],
    ) => {
      let urlValue: string | undefined = String(value);
      if (
        urlValue === "" ||
        urlValue === "all" ||
        (name === "sort" && urlValue === ADMIN_RESERVATIONS_DEFAULTS.sort) ||
        (name === "limit" && Number(value) === ADMIN_RESERVATIONS_DEFAULTS.limit)
      ) {
        urlValue = undefined;
      }
      replaceQuery([{ name, value: urlValue }]);
    },
    [replaceQuery],
  );

  const resetFilters = useCallback(() => {
    replaceQuery(
      ["q", "status", "pickupFrom", "pickupTo", "sort", "limit"].map(
        (name) => ({ name }),
      ),
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
              normalizedPage === ADMIN_RESERVATIONS_DEFAULTS.page
                ? undefined
                : String(normalizedPage),
          },
        ],
        false,
      );
    },
    [replaceQuery],
  );

  function openAction(
    reservation: AdminReservation,
    nextStatus: Exclude<ReservationStatus, "pending">,
  ) {
    if (mutation.isPending) return;
    setSelected(reservation);
    setTargetStatus(nextStatus);
    setDialogOpen(true);
  }

  async function confirm(reason?: string) {
    if (!selected || mutation.isPending) return;
    try {
      await mutation.mutateAsync({
        reservationId: selected.id,
        status: targetStatus,
        reason,
      });
      toast.success("Reservation status updated.");
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update the reservation.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-primary">
          Reservation operations
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Reservations
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Review booking requests, track active rentals, and inspect complete
          reservation records.
        </p>
      </div>

      {query.data && (
        <ReservationSummaryCards summary={query.data.summary} />
      )}
      <ReservationsFilters
        key={filters.q}
        value={filters}
        pending={isUpdatingResults}
        onChange={changeFilter}
        onReset={resetFilters}
      />

      {query.isPending ? (
        <ReservationsLoadingSkeleton />
      ) : query.isError ? (
        <ReservationsErrorState
          message={query.error.message}
          onRetry={() => query.refetch()}
        />
      ) : reservations.length === 0 ? (
        hasFilters || page > 1 ? (
          <ReservationsNoResultsState onReset={resetFilters} />
        ) : (
          <ReservationsEmptyState />
        )
      ) : (
        <div
          aria-busy={isUpdatingResults}
          className={isUpdatingResults ? "opacity-70 transition-opacity" : undefined}
        >
          <ReservationsTable
            reservations={reservations}
            busy={mutation.isPending}
            onAction={openAction}
          />
          <ReservationsMobileList
            reservations={reservations}
            busy={mutation.isPending}
            onAction={openAction}
          />
          {query.data && (
            <ReservationsPagination
              pagination={query.data.pagination}
              pending={isUpdatingResults}
              onPageChange={changePage}
            />
          )}
        </div>
      )}

      <ReservationActionDialog
        key={`${selected?.id}-${targetStatus}-${dialogOpen}`}
        reservation={selected}
        targetStatus={targetStatus}
        open={dialogOpen}
        busy={mutation.isPending}
        onOpenChange={setDialogOpen}
        onConfirm={confirm}
      />
    </div>
  );
}
