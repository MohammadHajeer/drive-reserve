"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CarFront,
  Clock3,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ADMIN_RESERVATION_TRANSITIONS,
  ADMIN_RESERVATION_TRANSITION_LABELS,
} from "@/features/admin/reservations/admin-reservation.types";
import { useAdminReservation } from "@/features/admin/reservations/hooks/use-admin-reservation";
import { useUpdateAdminReservationStatus } from "@/features/admin/reservations/hooks/use-update-admin-reservation-status";
import { AdminReservationRequestError } from "@/features/admin/reservations/services/admin-reservation.service";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/domain";

import { ReservationActionDialog } from "./reservation-action-dialog";
import { ReservationStatusBadge } from "./reservation-status-badge";
import {
  ReservationNotFoundState,
  ReservationsErrorState,
  ReservationsLoadingSkeleton,
} from "./reservations-states";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const date = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function AdminReservationDetailsPage({
  reservationId,
}: {
  reservationId: string;
}) {
  const query = useAdminReservation(reservationId);
  const mutation = useUpdateAdminReservationStatus();
  const [targetStatus, setTargetStatus] = useState<
    Exclude<ReservationStatus, "pending">
  >("confirmed");
  const [open, setOpen] = useState(false);

  if (query.isPending) return <ReservationsLoadingSkeleton />;
  if (
    query.isError &&
    query.error instanceof AdminReservationRequestError &&
    (query.error.code === "RESERVATION_NOT_FOUND" ||
      query.error.code === "INVALID_RESERVATION_ID")
  ) {
    return <ReservationNotFoundState />;
  }
  if (query.isError) {
    return (
      <ReservationsErrorState
        message={query.error.message}
        onRetry={() => query.refetch()}
      />
    );
  }

  const reservation = query.data;
  const transitions = ADMIN_RESERVATION_TRANSITIONS[reservation.status];
  const customerName =
    reservation.customer.fullName || "Customer unavailable";
  const carName =
    reservation.car.brand && reservation.car.model
      ? `${reservation.car.brand} ${reservation.car.model}`
      : "Vehicle unavailable";

  function ask(status: Exclude<ReservationStatus, "pending">) {
    if (mutation.isPending) return;
    setTargetStatus(status);
    setOpen(true);
  }

  async function confirm(reason?: string) {
    if (mutation.isPending) return;
    try {
      await mutation.mutateAsync({
        reservationId: reservation.id,
        status: targetStatus,
        reason,
      });
      toast.success("Reservation status updated.");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update the reservation.",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/admin/reservations"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-3 mb-2",
            )}
          >
            <ArrowLeft /> Back to reservations
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Reservation details
            </h1>
            <ReservationStatusBadge status={reservation.status} />
          </div>
          <p className="mt-2 break-all font-mono text-sm text-muted-foreground">
            {reservation.id}
          </p>
        </div>
        {transitions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {transitions.map((status) => (
              <Button
                key={status}
                type="button"
                variant={
                  status === "rejected" || status === "cancelled"
                    ? "destructive"
                    : "default"
                }
                disabled={mutation.isPending}
                onClick={() => ask(status)}
              >
                <ArrowRight />
                {ADMIN_RESERVATION_TRANSITION_LABELS[status]}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="rounded-2xl py-5 xl:col-span-2">
          <CardHeader>
            <CardTitle>Rental information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Info
              icon={CalendarDays}
              label="Pickup date"
              value={date.format(new Date(reservation.pickupDate))}
            />
            <Info
              icon={CalendarDays}
              label="Return date"
              value={date.format(new Date(reservation.returnDate))}
            />
            <Info
              icon={Clock3}
              label="Rental duration"
              value={`${reservation.rentalDays} days`}
            />
            <Info
              icon={CarFront}
              label="Daily price"
              value={money.format(reservation.pricePerDaySnapshot)}
            />
            <Separator className="sm:col-span-2" />
            <Detail label="Subtotal" value={money.format(reservation.subtotal)} />
            <Detail
              label="Total"
              value={money.format(reservation.totalPrice)}
              strong
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl py-5">
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Info icon={UserRound} label="Full name" value={customerName} />
            <Info
              icon={Mail}
              label="Email"
              value={reservation.customer.email ?? "Not available"}
            />
            <Info
              icon={Phone}
              label="Phone"
              value={reservation.customer.phone ?? "Not provided"}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl py-5">
          {reservation.car.primaryImageUrl && (
            <div className="relative mx-5 aspect-video overflow-hidden rounded-xl bg-muted">
              <Image
                src={reservation.car.primaryImageUrl}
                alt={carName}
                fill
                sizes="(max-width: 1280px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle>Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Info
              icon={CarFront}
              label="Car"
              value={
                reservation.car.year
                  ? `${carName} (${reservation.car.year})`
                  : carName
              }
            />
            <Detail
              label="Plate number"
              value={reservation.car.plateNumber ?? "Not available"}
            />
            <Detail
              label="Category"
              value={reservation.car.category ?? "Not available"}
            />
            <Detail label="Car ID" value={reservation.car.id} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl py-5 xl:col-span-2">
          <CardHeader>
            <CardTitle>Reservation record</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Reservation ID" value={reservation.id} />
            <Detail label="Current status" value={reservation.status} />
            <Detail
              label="Created"
              value={date.format(new Date(reservation.createdAt))}
            />
            <Detail
              label="Last updated"
              value={date.format(new Date(reservation.updatedAt))}
            />
            {reservation.rejectionReason && (
              <div className="rounded-xl bg-destructive/5 p-4 sm:col-span-2">
                <p className="text-sm font-semibold text-destructive">
                  Rejection reason
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {reservation.rejectionReason}
                </p>
              </div>
            )}
            {reservation.cancellationReason && (
              <div className="rounded-xl bg-muted p-4 sm:col-span-2">
                <p className="text-sm font-semibold">Cancellation reason</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {reservation.cancellationReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ReservationActionDialog
        key={`${targetStatus}-${open}`}
        reservation={reservation}
        targetStatus={targetStatus}
        open={open}
        busy={mutation.isPending}
        onOpenChange={setOpen}
        onConfirm={confirm}
      />
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 break-words font-medium">{value}</p>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          strong
            ? "mt-1 break-words text-xl font-bold"
            : "mt-1 break-words font-medium"
        }
      >
        {value}
      </p>
    </div>
  );
}
