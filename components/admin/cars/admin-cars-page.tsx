"use client";

import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAdminCars } from "@/features/admin/cars/hooks/use-admin-cars";
import { useDeleteCar } from "@/features/admin/cars/hooks/use-delete-car";
import { useUpdateCar } from "@/features/admin/cars/hooks/use-update-car";
import type { AdminCar } from "@/features/admin/cars/admin-car.types";
import { CarsFilters, type CarsFilterState } from "./cars-filters";
import { CarsTable } from "./cars-table";
import { CarsMobileList } from "./cars-mobile-list";
import { CarsPagination } from "./cars-pagination";
import { CarsEmptyState, CarsErrorState, CarsLoadingSkeleton } from "./cars-states";

const initialFilters: CarsFilterState = { search: "", status: "all", category: "all", transmission: "all", sort: "newest" };

export function AdminCarsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [busyCarId, setBusyCarId] = useState<string>();
  const query = useAdminCars({
    search: filters.search.trim() || undefined,
    status: filters.status === "all" ? undefined : filters.status,
    category: filters.category === "all" ? undefined : filters.category,
    transmission: filters.transmission === "all" ? undefined : filters.transmission,
    sort: filters.sort,
    page,
    limit: 10,
  });
  const deactivateMutation = useDeleteCar();
  const updateMutation = useUpdateCar();

  const categories = useMemo(() => {
    const values = query.data?.cars.map((car) => car.category).filter(Boolean) ?? [];
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [query.data?.cars]);

  function changeFilters(next: CarsFilterState) { setFilters(next); setPage(1); }
  function resetFilters() { setFilters(initialFilters); setPage(1); }

  async function deactivateCar(car: AdminCar) {
    if (!window.confirm(`Deactivate ${car.brand} ${car.model}? It will remain stored but will no longer be available to customers.`)) return;
    setBusyCarId(car.id);
    try { await deactivateMutation.mutateAsync(car.id); toast.success("Car deactivated successfully."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to deactivate the car."); }
    finally { setBusyCarId(undefined); }
  }

  async function restoreCar(car: AdminCar) {
    setBusyCarId(car.id);
    try { await updateMutation.mutateAsync({ carId: car.id, input: { status: "available" } }); toast.success("Car restored successfully."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to restore the car."); }
    finally { setBusyCarId(undefined); }
  }

  const cars = query.data?.cars ?? [];
  const total = query.data?.pagination.total ?? 0;
  const available = cars.filter((car) => car.status === "available").length;
  const maintenance = cars.filter((car) => car.status === "maintenance").length;
  const inactive = cars.filter((car) => car.status === "inactive").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-blue-600">Fleet operations</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Car Management</h1><p className="mt-2 max-w-2xl text-slate-500">Search, review, update, and safely deactivate every vehicle in the fleet.</p></div>
        <div className="flex flex-wrap gap-2"><button className="inline-flex h-11 items-center gap-2 rounded-xl border bg-white px-4 text-sm font-semibold hover:bg-slate-50"><Download className="size-4" /> Export CSV</button><Link href="/admin/cars/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"><Plus className="size-4" /> Add New Car</Link></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Total fleet", value: total }, { label: "Available on page", value: available }, { label: "Maintenance on page", value: maintenance }, { label: "Inactive on page", value: inactive }].map((item) => <article key={item.label} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{item.label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{query.isLoading ? "—" : item.value}</p></article>)}
      </div>

      <CarsFilters value={filters} categories={categories} onChange={changeFilters} onReset={resetFilters} />

      {query.isLoading ? <CarsLoadingSkeleton /> : query.isError ? <CarsErrorState message={query.error instanceof Error ? query.error.message : "An unexpected error occurred."} onRetry={() => query.refetch()} /> : cars.length === 0 ? <CarsEmptyState onReset={resetFilters} /> : <div><CarsTable cars={cars} busyCarId={busyCarId} onDeactivate={deactivateCar} onRestore={restoreCar} /><CarsMobileList cars={cars} busyCarId={busyCarId} onDeactivate={deactivateCar} onRestore={restoreCar} />{query.data && <div className="overflow-hidden rounded-b-2xl border border-t-0"><CarsPagination pagination={query.data.pagination} onPageChange={setPage} /></div>}</div>}
    </div>
  );
}
