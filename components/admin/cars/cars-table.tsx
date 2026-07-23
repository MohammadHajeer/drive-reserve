"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, PowerOff, RotateCcw } from "lucide-react";
import type { AdminCar } from "@/features/admin/cars/admin-car.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CarStatusBadge } from "./car-status-badge";

function primaryImage(car: AdminCar) {
  return car.images.find((image) => image.isPrimary)?.url ?? car.images[0]?.url ?? null;
}

export function CarsTable({ cars, busyCarId, onDeactivate, onRestore }: { cars: AdminCar[]; busyCarId?: string; onDeactivate: (car: AdminCar) => void; onRestore: (car: AdminCar) => void }) {
  return (
    <div className="hidden overflow-hidden rounded-t-2xl border border-b-0 bg-white md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Vehicle</th>
              <th className="px-5 py-4 font-semibold">Plate</th>
              <th className="px-5 py-4 font-semibold">Category</th>
              <th className="px-5 py-4 font-semibold">Transmission</th>
              <th className="px-5 py-4 font-semibold">Daily price</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Updated</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cars.map((car) => {
              const image = primaryImage(car);
              return (
                <tr key={car.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-20 overflow-hidden rounded-xl bg-slate-100">
                        {image ? <img src={image} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-slate-400">No image</div>}
                      </div>
                      <div><p className="font-semibold text-slate-900">{car.brand} {car.model}</p><p className="text-xs text-slate-500">{car.year} · {car.color}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-700">{car.plateNumber}</td>
                  <td className="px-5 py-4 capitalize text-slate-600">{car.category}</td>
                  <td className="px-5 py-4 capitalize text-slate-600">{car.transmission}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">${Number(car.pricePerDay).toFixed(2)}</td>
                  <td className="px-5 py-4"><CarStatusBadge status={car.status} /></td>
                  <td className="px-5 py-4 text-slate-500">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(car.updatedAt))}</td>
                  <td className="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="rounded-lg p-2 hover:bg-slate-100" disabled={busyCarId === car.id}><MoreHorizontal className="size-5" /></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={`/admin/cars/${car.id}/edit`} />}><Pencil /> Edit car</DropdownMenuItem>
                        {car.status === "inactive" ? (
                          <DropdownMenuItem onClick={() => onRestore(car)}><RotateCcw /> Restore car</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem variant="destructive" onClick={() => onDeactivate(car)}><PowerOff /> Deactivate car</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
