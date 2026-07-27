"use client";

import Link from "next/link";
import { ArrowRight, Eye, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminReservation } from "@/features/admin/reservations/admin-reservation.types";
import {
  ADMIN_RESERVATION_TRANSITIONS,
  ADMIN_RESERVATION_TRANSITION_LABELS,
} from "@/features/admin/reservations/admin-reservation.types";
import type { ReservationStatus } from "@/types/domain";

import { ReservationStatusBadge } from "./reservation-status-badge";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function ReservationsTable({
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
    <div className="hidden overflow-hidden rounded-2xl rounded-b-none border border-b-0 bg-card shadow-xs md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-275 text-left text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              {[
                "Reservation ID",
                "Customer",
                "Car",
                "Rental period",
                "Days",
                "Total",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className={`px-5 py-4 font-medium text-muted-foreground ${heading === "Total" || heading === "Actions" ? "text-right" : ""}`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {reservations.map((reservation) => {
              const transitions =
                ADMIN_RESERVATION_TRANSITIONS[reservation.status];
              const customerName =
                reservation.customer.fullName || "Customer unavailable";
              const carName =
                reservation.car.brand && reservation.car.model
                  ? `${reservation.car.brand} ${reservation.car.model}`
                  : "Vehicle unavailable";

              return (
                <tr key={reservation.id} className="hover:bg-muted/30">
                  <td
                    className="px-5 py-4 font-mono text-xs font-semibold"
                    title={reservation.id}
                  >
                    {reservation.id.slice(0, 8)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.customer.email ?? reservation.customer.phone ?? "No contact details"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{carName}</p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.car.plateNumber ?? "Plate unavailable"}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {date.format(new Date(reservation.pickupDate))} –{" "}
                    {date.format(new Date(reservation.returnDate))}
                  </td>
                  <td className="px-5 py-4">{reservation.rentalDays}</td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {money.format(reservation.totalPrice)}
                  </td>
                  <td className="px-5 py-4">
                    <ReservationStatusBadge status={reservation.status} />
                  </td>
                  <td className="sticky right-0 bg-card/95 px-5 py-4 text-right backdrop-blur">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={busy}
                            aria-label={`Actions for reservation ${reservation.id}`}
                          />
                        }
                      >
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={
                            <Link href={`/admin/reservations/${reservation.id}`} />
                          }
                        >
                          <Eye /> View details
                        </DropdownMenuItem>
                        {transitions.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            variant={
                              status === "rejected" || status === "cancelled"
                                ? "destructive"
                                : "default"
                            }
                            onClick={() => onAction(reservation, status)}
                          >
                            <ArrowRight />
                            {ADMIN_RESERVATION_TRANSITION_LABELS[status]}
                          </DropdownMenuItem>
                        ))}
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
