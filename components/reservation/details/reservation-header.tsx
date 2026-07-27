import Link from "next/link";
import { Ban, CalendarDays, CarFront } from "lucide-react";

import { ReservationStatusBadge } from "@/components/reservation/reservation-status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { CustomerReservationDetail } from "@/features/customer/reservations/customer-reservations.schema";
import { APP_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type ReservationHeaderProps = {
  canCancel: boolean;
  onCancel: () => void;
  reservation: CustomerReservationDetail;
};

export function ReservationHeader({
  canCancel,
  onCancel,
  reservation,
}: ReservationHeaderProps) {
  const carName = getCarName(reservation);

  return (
    <header className="flex flex-col gap-5 rounded-4xl bg-card p-6 shadow-md ring-1 ring-foreground/5 sm:p-8 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CarFront aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Reservation details</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {carName}
            </h1>
          </div>
          <ReservationStatusBadge status={reservation.status} />
        </div>

        <p className="mt-4 break-all font-mono text-xs text-muted-foreground">
          {reservation.id}
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" aria-hidden="true" />
          {formatDate(reservation.pickupDate)} to {formatDate(reservation.returnDate)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {getStatusDescription(reservation.status)}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 print:hidden">
        {canCancel ? (
          <Button type="button" variant="destructive" onClick={onCancel}>
            <Ban aria-hidden="true" />
            Cancel reservation
          </Button>
        ) : reservation.status === "active" ? (
          <p className="max-w-xs text-sm text-muted-foreground lg:text-right">
            Cancellation is unavailable after the rental has started.
          </p>
        ) : reservation.status === "completed" ||
          reservation.status === "cancelled" ||
          reservation.status === "rejected" ? (
          <Link
            href={APP_ROUTES.cars}
            className={cn(buttonVariants(), "rounded-4xl")}
          >
            Book another car
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export function getReservationCarName(reservation: CustomerReservationDetail) {
  return getCarName(reservation);
}

function getCarName(reservation: CustomerReservationDetail) {
  return [reservation.car.brand, reservation.car.model]
    .filter(Boolean)
    .join(" ") || "Reserved vehicle";
}

function getStatusDescription(status: CustomerReservationDetail["status"]) {
  const descriptions: Record<CustomerReservationDetail["status"], string> = {
    pending: "Your request was submitted and is awaiting approval.",
    confirmed: "Your reservation is confirmed and scheduled for pickup.",
    active: "Your rental is currently in progress.",
    completed: "This rental has been completed.",
    cancelled: "This reservation was cancelled and will not proceed.",
    rejected: "This reservation request was rejected and will not proceed.",
  };

  return descriptions[status];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
