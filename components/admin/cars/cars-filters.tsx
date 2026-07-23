"use client";

import { Search, X } from "lucide-react";
import type { AdminCarsSort } from "@/features/admin/cars/admin-car.types";
import type { CarStatus, Transmission } from "@/types/domain";

export type CarsFilterState = {
  search: string;
  status: "all" | CarStatus;
  category: string;
  transmission: "all" | Transmission;
  sort: AdminCarsSort;
};

export function CarsFilters({
  value,
  categories,
  onChange,
  onReset,
}: {
  value: CarsFilterState;
  categories: string[];
  onChange: (next: CarsFilterState) => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_180px_180px_180px_180px_auto]">
        <label className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={value.search}
            onChange={(event) => onChange({ ...value, search: event.target.value })}
            placeholder="Search brand, model, or plate..."
            className="h-11 w-full rounded-xl border bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <select value={value.status} onChange={(e) => onChange({ ...value, status: e.target.value as CarsFilterState["status"] })} className="h-11 rounded-xl border bg-white px-3 text-sm outline-none focus:border-blue-500">
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>

        <select value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })} className="h-11 rounded-xl border bg-white px-3 text-sm outline-none focus:border-blue-500">
          <option value="all">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>

        <select value={value.transmission} onChange={(e) => onChange({ ...value, transmission: e.target.value as CarsFilterState["transmission"] })} className="h-11 rounded-xl border bg-white px-3 text-sm outline-none focus:border-blue-500">
          <option value="all">All transmissions</option>
          <option value="automatic">Automatic</option>
          <option value="manual">Manual</option>
        </select>

        <select value={value.sort} onChange={(e) => onChange({ ...value, sort: e.target.value as AdminCarsSort })} className="h-11 rounded-xl border bg-white px-3 text-sm outline-none focus:border-blue-500">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="year-desc">Newest model year</option>
          <option value="brand-asc">Brand A–Z</option>
        </select>

        <button onClick={onReset} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <X className="size-4" /> Reset
        </button>
      </div>
    </div>
  );
}
