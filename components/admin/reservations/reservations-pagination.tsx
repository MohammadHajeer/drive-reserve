"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AdminReservationsPagination } from "@/features/admin/reservations/admin-reservation.types";

export function ReservationsPagination({
  pagination,
  pending,
  onPageChange,
}: {
  pagination: AdminReservationsPagination;
  pending: boolean;
  onPageChange: (page: number) => void;
}) {
  if (!pagination.total) return null;
  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  return (
    <div className="flex flex-col gap-3 border-t bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{start}–{end}</strong> of{" "}
        <strong className="text-foreground">{pagination.total}</strong>{" "}
        reservations
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending || !pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft /> Previous
        </Button>
        <span
          aria-current="page"
          className="grid h-9 min-w-9 place-items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
        >
          {pagination.page}
        </span>
        <Button
          type="button"
          variant="outline"
          disabled={pending || !pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
