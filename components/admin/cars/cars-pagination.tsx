"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminCarsPagination } from "@/features/admin/cars/admin-car.types";

export function CarsPagination({
  pagination,
  onPageChange,
}: {
  pagination: AdminCarsPagination;
  onPageChange: (page: number) => void;
}) {
  if (pagination.total === 0) return null;
  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col gap-3 border-t bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing{" "}
        <strong className="text-slate-700">
          {start}–{end}
        </strong>{" "}
        of <strong className="text-slate-700">{pagination.total}</strong> cars
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
          className="rounded-lg"
        >
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <span
          aria-current="page"
          className="grid h-9 min-w-9 place-items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white"
        >
          {pagination.page}
        </span>
        <Button
          type="button"
          variant="outline"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          className="rounded-lg"
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
