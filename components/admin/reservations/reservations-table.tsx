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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ADMIN_RESERVATION_TRANSITIONS,
  ADMIN_RESERVATION_TRANSITION_LABELS,
  type AdminReservation,
} from "@/features/admin/reservations/admin-reservation.types";
import type { ReservationStatus } from "@/types/domain";

import { ReservationStatusBadge } from "./reservation-status-badge";

const moneyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

type ReservationsTableProps = {
  reservations: readonly AdminReservation[];
  busy: boolean;
  onAction: (
    reservation: AdminReservation,
    status: Exclude<ReservationStatus, "pending">,
  ) => void;
};

function formatDate(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return dateFormatter.format(parsedDate);
}

export function ReservationsTable({
  reservations,
  busy,
  onAction,
}: ReservationsTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-2xl rounded-b-none border border-b-0 bg-card shadow-xs md:block">
      <Table className="min-w-275">
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-auto px-5 py-4">Reservation ID</TableHead>

            <TableHead className="h-auto px-5 py-4">Customer</TableHead>

            <TableHead className="h-auto px-5 py-4">Vehicle</TableHead>

            <TableHead className="h-auto px-5 py-4">Rental period</TableHead>

            <TableHead className="h-auto px-5 py-4 text-center">Days</TableHead>

            <TableHead className="h-auto px-5 py-4 text-right">Total</TableHead>

            <TableHead className="h-auto px-5 py-4">Status</TableHead>

            <TableHead className="sticky right-0 z-10 h-auto bg-muted/95 px-5 py-4 text-right backdrop-blur-sm">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reservations.map((reservation) => {
            const transitions =
              ADMIN_RESERVATION_TRANSITIONS[reservation.status];

            const customerName =
              reservation.customer.fullName?.trim() || "Customer unavailable";

            const customerContact =
              reservation.customer.email?.trim() ||
              reservation.customer.phone?.trim() ||
              "No contact details";

            const carName =
              reservation.car.brand?.trim() && reservation.car.model?.trim()
                ? `${reservation.car.brand} ${reservation.car.model}`
                : "Vehicle unavailable";

            return (
              <TableRow key={reservation.id} aria-busy={busy} className="group">
                <TableCell
                  title={reservation.id}
                  className="px-5 py-4 font-mono text-xs font-semibold"
                >
                  <span className="inline-flex rounded-md border bg-muted/50 px-2 py-1">
                    {reservation.id.slice(0, 8)}
                  </span>
                </TableCell>

                <TableCell className="px-5 py-4">
                  <div className="min-w-0">
                    <p className="max-w-52 truncate font-medium text-foreground">
                      {customerName}
                    </p>

                    <p className="mt-0.5 max-w-52 truncate text-xs text-muted-foreground">
                      {customerContact}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-4">
                  <div className="min-w-0">
                    <p className="max-w-48 truncate font-medium text-foreground">
                      {carName}
                    </p>

                    <p className="mt-0.5 max-w-48 truncate text-xs text-muted-foreground">
                      {reservation.car.plateNumber?.trim() ||
                        "Plate unavailable"}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                  {formatDate(reservation.pickupDate)}
                  <span className="mx-1.5">–</span>
                  {formatDate(reservation.returnDate)}
                </TableCell>

                <TableCell className="px-5 py-4 text-center font-medium tabular-nums">
                  {reservation.rentalDays}
                </TableCell>

                <TableCell className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-foreground">
                  {moneyFormatter.format(reservation.totalPrice)}
                </TableCell>

                <TableCell className="px-5 py-4">
                  <ReservationStatusBadge status={reservation.status} />
                </TableCell>

                <TableCell className="sticky right-0 z-10 bg-card/95 px-5 py-4 text-right backdrop-blur-sm transition-colors group-hover:bg-muted/50">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={busy}
                          aria-label={`Actions for reservation ${reservation.id}`}
                          className="size-9"
                        />
                      }
                    >
                      <MoreHorizontal className="size-5" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl"
                    >
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/admin/reservations/${reservation.id}`}
                          />
                        }
                        className="rounded-lg"
                      >
                        <Eye className="size-4" />
                        View details
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
                          className="rounded-lg"
                        >
                          <ArrowRight className="size-4" />

                          {ADMIN_RESERVATION_TRANSITION_LABELS[status]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
