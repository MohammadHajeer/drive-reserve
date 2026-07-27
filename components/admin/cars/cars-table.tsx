"use client";

import Link from "next/link";
import {
  CarFront,
  MoreHorizontal,
  Pencil,
  PowerOff,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AdminCar } from "@/features/admin/cars/admin-car.types";
import type { AdminCarListItem } from "./admin-car-list-item";
import { CarStatusBadge } from "./car-status-badge";

type CarsTableProps = {
  items: readonly AdminCarListItem[];
  busyCarId?: string;
  onDeactivate: (car: AdminCar) => void;
  onRestore: (car: AdminCar) => void;
};

export function CarsTable({
  items,
  busyCarId,
  onDeactivate,
  onRestore,
}: CarsTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-2xl rounded-b-none border border-b-0 bg-card shadow-xs md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-245 text-left text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-5 py-4 font-medium text-muted-foreground">
                Vehicle
              </th>

              <th className="px-5 py-4 font-medium text-muted-foreground">
                Plate
              </th>

              <th className="px-5 py-4 font-medium text-muted-foreground">
                Category
              </th>

              <th className="px-5 py-4 font-medium text-muted-foreground">
                Transmission
              </th>

              <th className="px-5 py-4 text-right font-medium text-muted-foreground">
                Daily price
              </th>

              <th className="px-5 py-4 font-medium text-muted-foreground">
                Status
              </th>

              <th className="px-5 py-4 font-medium text-muted-foreground">
                Updated
              </th>

              <th className="sticky right-0 bg-muted/95 px-5 py-4 text-right font-medium text-muted-foreground backdrop-blur-sm">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {items.map((item) => {
              const { car } = item;
              const isBusy = busyCarId === car.id;

              return (
                <tr
                  key={car.id}
                  className="group transition-colors hover:bg-muted/30"
                >
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            sizes="80px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-muted-foreground">
                            <CarFront className="size-5" aria-hidden="true" />
                            <span className="sr-only">
                              No image available
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {item.name}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {item.vehicleMetaLabel}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-md border bg-muted/50 px-2 py-1 font-mono text-xs font-medium text-foreground">
                      {car.plateNumber}
                    </span>
                  </td>

                  <td className="px-5 py-4 capitalize text-muted-foreground">
                    {car.category}
                  </td>

                  <td className="px-5 py-4 capitalize text-muted-foreground">
                    {car.transmission}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-foreground">
                    {item.dailyPriceLabel}
                  </td>

                  <td className="px-5 py-4">
                    <CarStatusBadge status={car.status} />
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                    {item.updatedLabel}
                  </td>

                  <td className="sticky right-0 bg-card px-5 py-4 text-right transition-colors group-hover:bg-muted">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${item.name}`}
                          />
                        }
                        disabled={isBusy}
                      >
                        <MoreHorizontal className="size-5" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="w-44 rounded-xl"
                      >
                        <DropdownMenuItem
                          render={<Link href={item.editHref} />}
                          className="rounded-lg"
                        >
                          <Pencil />
                          Edit car
                        </DropdownMenuItem>

                        {car.status === "inactive" ? (
                          <DropdownMenuItem
                            onClick={() => onRestore(car)}
                            className="rounded-lg"
                          >
                            <RotateCcw />
                            Restore car
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDeactivate(car)}
                            className="rounded-lg"
                          >
                            <PowerOff />
                            Deactivate car
                          </DropdownMenuItem>
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