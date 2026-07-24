"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CarFront,
  Loader2,
  Pencil,
  PowerOff,
  RotateCcw,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AdminCar } from "@/features/admin/cars/admin-car.types";
import { cn } from "@/lib/utils";

import type { AdminCarListItem } from "./admin-car-list-item";
import { CarStatusBadge } from "./car-status-badge";

type CarsMobileListProps = {
  items: readonly AdminCarListItem[];
  busyCarId?: string;
  onDeactivate: (car: AdminCar) => void;
  onRestore: (car: AdminCar) => void;
};

export function CarsMobileList({
  items,
  busyCarId,
  onDeactivate,
  onRestore,
}: CarsMobileListProps) {
  return (
    <div className="space-y-4 md:hidden">
      {items.map((item) => {
        const { car } = item;
        const isBusy = busyCarId === car.id;
        const isInactive = car.status === "inactive";

        return (
          <article
            key={car.id}
            aria-busy={isBusy}
            className="group overflow-hidden rounded-2xl border bg-card shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="relative aspect-video overflow-hidden border-b bg-muted">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 0px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <CarFront className="size-7" aria-hidden="true" />
                    <span className="text-xs">No vehicle image</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 p-4">
              <header className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-foreground">
                    {item.name}
                  </h2>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {item.mobileMetaLabel}
                  </p>
                </div>

                <CarStatusBadge status={car.status} />
              </header>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-muted/40 p-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Plate</dt>
                  <dd className="mt-1">
                    <span className="inline-flex rounded-md border bg-background px-2 py-1 font-mono text-xs font-medium">
                      {car.plateNumber}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">Daily price</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {item.dailyPriceLabel}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">Category</dt>
                  <dd className="mt-1 font-medium capitalize text-foreground">
                    {car.category}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Transmission
                  </dt>
                  <dd className="mt-1 font-medium capitalize text-foreground">
                    {car.transmission}
                  </dd>
                </div>
              </dl>

              <div className="grid gap-2 border-t pt-4 sm:grid-cols-2">
                <Link
                  href={item.editHref}
                  aria-disabled={isBusy}
                  tabIndex={isBusy ? -1 : undefined}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full rounded-xl font-semibold",
                    isBusy && "pointer-events-none opacity-50",
                  )}
                >
                  <Pencil className="size-4" />
                  Edit car
                </Link>

                {isInactive ? (
                  <Button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onRestore(car)}
                    className="w-full rounded-xl font-semibold"
                  >
                    {isBusy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RotateCcw className="size-4" />
                    )}

                    {isBusy ? "Restoring..." : "Restore car"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isBusy}
                    onClick={() => onDeactivate(car)}
                    className="w-full rounded-xl font-semibold"
                  >
                    {isBusy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <PowerOff className="size-4" />
                    )}

                    {isBusy ? "Deactivating..." : "Deactivate"}
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