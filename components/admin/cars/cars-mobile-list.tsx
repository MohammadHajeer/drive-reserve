"use client";

import Link from "next/link";
import { Pencil, PowerOff, RotateCcw } from "lucide-react";
import type { AdminCar } from "@/features/admin/cars/admin-car.types";
import { CarStatusBadge } from "./car-status-badge";

export function CarsMobileList({ cars, busyCarId, onDeactivate, onRestore }: { cars: AdminCar[]; busyCarId?: string; onDeactivate: (car: AdminCar) => void; onRestore: (car: AdminCar) => void }) {
  return (
    <div className="space-y-3 md:hidden">
      {cars.map((car) => {
        const image = car.images.find((item) => item.isPrimary)?.url ?? car.images[0]?.url;
        return (
          <article key={car.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="h-44 bg-slate-100">{image ? <img src={image} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm text-slate-400">No vehicle image</div>}</div>
            <div className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-950">{car.brand} {car.model}</h2><p className="text-sm text-slate-500">{car.year} · {car.plateNumber}</p></div><CarStatusBadge status={car.status} /></div>
              <div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-slate-400">Category</p><p className="mt-1 capitalize font-medium">{car.category}</p></div><div><p className="text-xs text-slate-400">Daily price</p><p className="mt-1 font-semibold">${Number(car.pricePerDay).toFixed(2)}</p></div></div>
              <div className="flex gap-2 border-t pt-4">
                <Link href={`/admin/cars/${car.id}/edit`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"><Pencil className="size-4" /> Edit</Link>
                {car.status === "inactive" ? <button disabled={busyCarId === car.id} onClick={() => onRestore(car)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"><RotateCcw className="size-4" /> Restore</button> : <button disabled={busyCarId === car.id} onClick={() => onDeactivate(car)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"><PowerOff className="size-4" /> Deactivate</button>}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
