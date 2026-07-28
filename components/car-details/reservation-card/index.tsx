"use client";

import {
  Ban,
  LoaderCircle,
  RotateCw,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Car } from "@/types/domain";

import { ReservationCalendar } from "./reservation-calendar";
import { useReservationCard } from "./use-reservation-card";
import {
  formatPreviewDate,
  getUnavailableMessage,
} from "./reservation-card.utils";

type ReservationCardProps = {
  carId: Car["id"];
  pricePerDay: Car["price_per_day"];
  status: Car["status"];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ReservationCard({
  carId,
  pricePerDay,
  status,
}: ReservationCardProps) {
  const reservation = useReservationCard({
    carId,
    pricePerDay,
    status,
  });

  const {
    hasCompleteRange,
    previewState,
    availablePreview,
    displayedPricePerDay,
    primaryAction,
    handlePrimaryAction,
    retryReservationPreview,
    calendar,
  } = reservation;

  return (
    <div
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      data-car-id={carId}
    >
      <header>
        <p className="text-sm font-semibold text-foreground">Reserve this car</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {currencyFormatter.format(displayedPricePerDay)}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            / day
          </span>
        </div>
      </header>

      {hasCompleteRange && previewState.status === "loading" ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <LoaderCircle
            className="size-4 shrink-0 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
          Checking availability and price…
        </div>
      ) : null}

      {hasCompleteRange &&
      previewState.status === "success" &&
      !previewState.preview.available ? (
        <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <Ban
              className="mt-0.5 size-5 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Dates unavailable
              </p>
              <p className="mt-1 text-xs leading-5 text-destructive/80">
                {getUnavailableMessage(
                  previewState.preview.unavailableReason,
                )}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {hasCompleteRange && previewState.status === "error" ? (
        <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-destructive">
                Availability check failed
              </p>
              <p className="mt-1 text-xs leading-5 text-destructive/80">
                {previewState.message}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={retryReservationPreview}
              className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <RotateCw className="size-3" aria-hidden="true" />
              Retry
            </Button>
          </div>
        </div>
      ) : null}

      <ReservationCalendar {...calendar} />

      {availablePreview &&
      availablePreview.pricePerDay !== null &&
      availablePreview.totalPrice !== null ? (
        <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-muted/20 px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Pickup date
            </dt>
            <dd className="text-right text-sm font-semibold text-foreground">
              {formatPreviewDate(availablePreview.pickupDate)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Return date
            </dt>
            <dd className="text-right text-sm font-semibold text-foreground">
              {formatPreviewDate(availablePreview.returnDate)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Rental period
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              {availablePreview.rentalDays}{" "}
              {availablePreview.rentalDays === 1 ? "day" : "days"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-xs font-medium text-muted-foreground">
              Price calculation
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              {availablePreview.rentalDays} ×{" "}
              {currencyFormatter.format(availablePreview.pricePerDay)}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-4 py-3.5">
            <dt className="text-sm font-semibold text-foreground">
              Estimated total
            </dt>
            <dd className="text-xl font-bold tracking-tight text-primary">
              {currencyFormatter.format(availablePreview.totalPrice)}
            </dd>
          </div>
        </dl>
      ) : null}

      <Button
        type="button"
        size="lg"
        disabled={primaryAction.disabled}
        onClick={handlePrimaryAction}
        className="mt-6 h-12 w-full rounded-xl text-sm font-semibold"
      >
        {primaryAction.loading ? (
          <LoaderCircle
            className="size-4 animate-spin"
            aria-hidden="true"
          />
        ) : null}
        {primaryAction.label}
      </Button>

      <div className="mt-3 flex items-start justify-center gap-2 text-[11px] leading-4 text-muted-foreground">
        <ShieldCheck
          className="mt-0.5 size-3.5 shrink-0"
          aria-hidden="true"
        />
        <p>
          No reservation is created until you confirm the next step.
          Availability and pricing will be checked again before submission.
        </p>
      </div>
    </div>
  );
}
