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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <Table className="min-w-245">
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-auto px-5 py-4">Vehicle</TableHead>

              <TableHead className="h-auto px-5 py-4">Plate</TableHead>

              <TableHead className="h-auto px-5 py-4">Category</TableHead>

              <TableHead className="h-auto px-5 py-4">Transmission</TableHead>

              <TableHead className="h-auto px-5 py-4 text-right">
                Daily price
              </TableHead>

              <TableHead className="h-auto px-5 py-4">Status</TableHead>

              <TableHead className="h-auto px-5 py-4">Updated</TableHead>

              <TableHead className="sticky right-0 z-10 h-auto bg-muted/95 px-5 py-4 text-right backdrop-blur-sm">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item) => {
              const { car } = item;
              const isBusy = busyCarId === car.id;

              return (
                <TableRow key={car.id} aria-busy={isBusy} className="group">
                  <TableCell className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-muted-foreground">
                            <CarFront className="size-5" aria-hidden="true" />
                            <span className="sr-only">No image available</span>
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
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <span className="inline-flex rounded-md border bg-muted/50 px-2 py-1 font-mono text-xs font-medium text-foreground">
                      {car.plateNumber}
                    </span>
                  </TableCell>

                  <TableCell className="px-5 py-4 capitalize text-muted-foreground">
                    {car.category}
                  </TableCell>

                  <TableCell className="px-5 py-4 capitalize text-muted-foreground">
                    {car.transmission}
                  </TableCell>

                  <TableCell className="whitespace-nowrap px-5 py-4 text-right font-semibold text-foreground">
                    {item.dailyPriceLabel}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <CarStatusBadge status={car.status} />
                  </TableCell>

                  <TableCell className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                    {item.updatedLabel}
                  </TableCell>

                  <TableCell className="sticky right-0 z-10 bg-card px-5 py-4 text-right transition-colors group-hover:bg-muted/50">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${item.name}`}
                            className="size-9"
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
                          <Pencil className="size-4" />
                          Edit car
                        </DropdownMenuItem>

                        {car.status === "inactive" ? (
                          <DropdownMenuItem
                            onClick={() => onRestore(car)}
                            className="rounded-lg"
                          >
                            <RotateCcw className="size-4" />
                            Restore car
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDeactivate(car)}
                            className="rounded-lg"
                          >
                            <PowerOff className="size-4" />
                            Deactivate car
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
