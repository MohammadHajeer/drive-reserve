"use client";

import Link from "next/link";
import { Pencil, PowerOff, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { AdminCar } from "@/features/admin/cars/admin-car.types";
import { cn } from "@/lib/utils";
import type { AdminCarListItem } from "./admin-car-list-item";
import { CarStatusBadge } from "./car-status-badge";

export function CarsMobileList({
  items,
  busyCarId,
  onDeactivate,
  onRestore,
}: {
  items: readonly AdminCarListItem[];
  busyCarId?: string;
  onDeactivate: (car: AdminCar) => void;
  onRestore: (car: AdminCar) => void;
}) {
  return (
    <div className="space-y-3 md:hidden">
      {items.map((item) => {
        const { car } = item;

        return (
          <article
            key={car.id}
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            <div className="h-44 bg-slate-100">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-slate-400">
                  No vehicle image
                </div>
              )}
            </div>
            <div className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-950">{item.name}</h2>
                  <p className="text-sm text-slate-500">
                    {item.mobileMetaLabel}
                  </p>
                </div>
                <CarStatusBadge status={car.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Category</p>
                  <p className="mt-1 font-medium capitalize">{car.category}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Daily price</p>
                  <p className="mt-1 font-semibold">{item.dailyPriceLabel}</p>
                </div>
              </div>
              <div className="flex gap-2 border-t pt-4">
                <Link
                  href={item.editHref}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "flex-1 rounded-xl font-semibold",
                  )}
                >
                  <Pencil className="size-4" /> Edit
                </Link>
                {car.status === "inactive" ? (
                  <Button
                    type="button"
                    disabled={busyCarId === car.id}
                    onClick={() => onRestore(car)}
                    className="flex-1 rounded-xl bg-emerald-600 font-semibold hover:bg-emerald-700"
                  >
                    <RotateCcw className="size-4" /> Restore
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={busyCarId === car.id}
                    onClick={() => onDeactivate(car)}
                    className="flex-1 rounded-xl font-semibold"
                  >
                    <PowerOff className="size-4" /> Deactivate
                  </Button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
