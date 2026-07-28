"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CarFront, Eye } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AdminReservation } from "@/features/admin/reservations/admin-reservation.types";
import {
  ADMIN_RESERVATION_TRANSITIONS,
  ADMIN_RESERVATION_TRANSITION_LABELS,
} from "@/features/admin/reservations/admin-reservation.types";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/domain";

import { ReservationStatusBadge } from "./reservation-status-badge";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ReservationsMobileList({
  reservations,
  busy,
  onAction,
}: {
  reservations: readonly AdminReservation[];
  busy: boolean;
  onAction: (
    reservation: AdminReservation,
    status: Exclude<ReservationStatus, "pending">,
  ) => void;
}) {
  return (
    <div className="space-y-3 md:hidden">
      {reservations.map((reservation) => {
        const carName =
          reservation.car.brand && reservation.car.model
            ? `${reservation.car.brand} ${reservation.car.model}`
            : "Vehicle unavailable";
        return (
          <article
            key={reservation.id}
            className="rounded-2xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-bold" title={reservation.id}>
                  {reservation.id}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {reservation.customer.fullName || "Customer unavailable"}
                </p>
              </div>
              <ReservationStatusBadge status={reservation.status} />
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <p className="flex items-center gap-2">
                <CarFront className="size-4 text-muted-foreground" />
                {carName} · {reservation.car.plateNumber ?? "Plate unavailable"}
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" />
                {reservation.pickupDate} → {reservation.returnDate} ({reservation.rentalDays}{" "}
                days)
              </p>
              <p className="font-semibold">
                Total: {money.format(reservation.totalPrice)}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/admin/reservations/${reservation.id}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-lg",
                )}
              >
                <Eye /> View
              </Link>
              {ADMIN_RESERVATION_TRANSITIONS[reservation.status].map(
                (status) => (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={
                      status === "rejected" || status === "cancelled"
                        ? "destructive"
                        : "default"
                    }
                    disabled={busy}
                    onClick={() => onAction(reservation, status)}
                  >
                    <ArrowRight />
                    {ADMIN_RESERVATION_TRANSITION_LABELS[status]}
                  </Button>
                ),
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
