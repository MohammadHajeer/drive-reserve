"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CircleX,
  LogIn,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { CustomerReservationCancelDialog } from "@/components/reservation/customer-reservation-cancel-dialog";
import { ReservationCustomerCard } from "@/components/reservation/details/reservation-customer-card";
import {
  getReservationCarName,
  ReservationHeader,
} from "@/components/reservation/details/reservation-header";
import { ReservationItineraryCard } from "@/components/reservation/details/reservation-itinerary-card";
import { ReservationPriceBreakdownCard } from "@/components/reservation/details/reservation-price-breakdown-card";
import { ReservationProgress } from "@/components/reservation/details/reservation-progress";
import { ReservationSummary } from "@/components/reservation/details/reservation-summary";
import { ReservationVehicleCard } from "@/components/reservation/details/reservation-vehicle-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerReservationDetail } from "@/features/customer/reservations/customer-reservations.schema";
import { useCancelCustomerReservation } from "@/features/customer/reservations/hooks/use-cancel-customer-reservation";
import { useCustomerReservation } from "@/features/customer/reservations/hooks/use-customer-reservation";
import { CustomerReservationRequestError } from "@/features/customer/reservations/services/customer-reservations.service";
import { APP_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function CustomerReservationDetailsPage({
  reservationId,
}: {
  reservationId: string;
}) {
  const query = useCustomerReservation(reservationId);
  const cancellation = useCancelCustomerReservation();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  if (query.isPending) return <ReservationDetailsSkeleton />;

  if (query.isError) {
    return (
      <ReservationDetailsError
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const reservation = query.data;
  const canCancel =
    reservation.status === "pending" || reservation.status === "confirmed";

  function cancel(reason: string) {
    if (cancellation.isPending || !canCancel) return;

    cancellation.mutate(
      { reservationId, reason },
      {
        onSuccess: () => {
          toast.success("Reservation cancelled successfully.");
          setCancelDialogOpen(false);
        },
        onError: (error) => {
          toast.error(
            error instanceof CustomerReservationRequestError
              ? error.message
              : "Unable to cancel the reservation. Please try again.",
          );
        },
      },
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href={APP_ROUTES.customerReservations}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to my reservations
      </Link>

      <ReservationHeader
        reservation={reservation}
        canCancel={canCancel}
        onCancel={() => setCancelDialogOpen(true)}
      />

      <TerminalReasonAlert reservation={reservation} />
      <ReservationSummary reservation={reservation} />
      <ReservationProgress
        status={reservation.status}
        createdAt={reservation.createdAt}
        pickupDate={reservation.pickupDate}
        returnDate={reservation.returnDate}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="space-y-6">
          <ReservationVehicleCard car={reservation.car} />
          <ReservationItineraryCard
            pickupDate={reservation.pickupDate}
            returnDate={reservation.returnDate}
            rentalDays={reservation.rentalDays}
          />
        </div>
        <div className="space-y-6">
          <ReservationPriceBreakdownCard reservation={reservation} />
          <ReservationCustomerCard customer={reservation.customer} />
        </div>
      </div>

      <CustomerReservationCancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onCancel={cancel}
        isPending={cancellation.isPending}
        carName={getReservationCarName(reservation)}
      />
    </div>
  );
}

function TerminalReasonAlert({
  reservation,
}: {
  reservation: CustomerReservationDetail;
}) {
  const terminal =
    reservation.status === "rejected" && reservation.rejectionReason
      ? {
          title: "Reservation rejected",
          reason: reservation.rejectionReason,
        }
      : reservation.status === "cancelled" && reservation.cancellationReason
        ? {
            title: "Reservation cancelled",
            reason: reservation.cancellationReason,
          }
        : null;

  if (!terminal) return null;

  return (
    <div
      role="alert"
      className="rounded-4xl border border-destructive/25 bg-destructive/5 p-5 text-destructive sm:p-6"
    >
      <div className="flex gap-3">
        <CircleX className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <h2 className="font-bold">{terminal.title}</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
            {terminal.reason}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Updated {formatDateTime(reservation.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReservationDetailsSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      aria-label="Loading reservation details"
    >
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-56 w-full rounded-4xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-28 rounded-4xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-4xl" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-4xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-4xl" />
      </div>
    </div>
  );
}

function ReservationDetailsError({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  const requestError =
    error instanceof CustomerReservationRequestError ? error : null;
  const status = requestError?.status;
  const isNotFound = status === 404;
  const isUnauthenticated = status === 401;
  const isForbidden = status === 403;
  const isInvalid = status === 400;
  const title = isNotFound
    ? "Reservation not found"
    : isUnauthenticated
      ? "Authentication required"
      : isForbidden
        ? "Reservation unavailable"
        : isInvalid
          ? "Invalid reservation link"
          : "We couldn't load this reservation";
  const message = isNotFound
    ? "The reservation does not exist or does not belong to your account."
    : isUnauthenticated
      ? "Sign in again to view your reservation details."
      : isForbidden
        ? "Your account is not allowed to view this customer reservation."
        : isInvalid
          ? "The reservation identifier in this link is not valid."
          : requestError?.message || "Try again in a moment.";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            {isUnauthenticated ? (
              <LogIn aria-hidden="true" />
            ) : (
              <AlertCircle aria-hidden="true" />
            )}
          </span>
          <h1 className="mt-5 text-xl font-bold">{title}</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {!isNotFound && !isInvalid && !isForbidden && !isUnauthenticated && (
              <Button type="button" variant="outline" onClick={onRetry}>
                <RefreshCw aria-hidden="true" />
                Try again
              </Button>
            )}
            <Link
              href={isUnauthenticated ? APP_ROUTES.login : APP_ROUTES.customerReservations}
              className={cn(buttonVariants(), "rounded-4xl")}
            >
              {isUnauthenticated ? "Sign in" : "Back to reservations"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
