"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminCarsPagination } from "@/features/admin/cars/admin-car.types";

export function CarsPagination({ pagination, onPageChange }: { pagination: AdminCarsPagination; onPageChange: (page: number) => void }) {
  if (pagination.total === 0) return null;
  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col gap-3 border-t bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">Showing <strong className="text-slate-700">{start}–{end}</strong> of <strong className="text-slate-700">{pagination.total}</strong> cars</p>
      <div className="flex items-center gap-2">
        <button disabled={!pagination.hasPreviousPage} onClick={() => onPageChange(pagination.page - 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="size-4" /> Previous</button>
        <span className="grid h-9 min-w-9 place-items-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white">{pagination.page}</span>
        <button disabled={!pagination.hasNextPage} onClick={() => onPageChange(pagination.page + 1)} className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight className="size-4" /></button>
      </div>
    </div>
  );
}
