"use client";

import React, { useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Calendar as CalendarIcon, ArrowRight, ShieldCheck, Info, Ban } from "lucide-react";

interface ReservationCardProps {
  pricePerDay: number;
  serviceFee: number;
  insurancePerDay: number;
  hostName: string;
  hostBadge: string;
  isAvailable?: boolean;
}

export function ReservationCard({
  pricePerDay,
  serviceFee,
  insurancePerDay,
  hostName,
  hostBadge,
  isAvailable = true,
}: ReservationCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const todayStr = new Date().toISOString().split("T")[0];
  const defaultReturn = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const pickupDate = searchParams.get("pickup") || todayStr;
  const returnDate = searchParams.get("return") || defaultReturn;

  const calculatedDays = useMemo(() => {
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [pickupDate, returnDate]);

  const updateDates = (newPickup: string, newReturn: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pickup", newPickup);
    params.set("return", newReturn);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const rentalTotal = pricePerDay * calculatedDays;
  const insuranceTotal = insurancePerDay * calculatedDays;
  const grandTotal = rentalTotal + serviceFee + insuranceTotal;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        {!isAvailable && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            <Ban className="h-4 w-4 shrink-0" />
            <span>This car is currently occupied and unavailable for booking.</span>
          </div>
        )}

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">${pricePerDay}</span>
          <span className="text-sm font-medium text-muted-foreground">/ day</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Free cancellation up to 48 hours before pickup.
        </p>

        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pickup Date
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-medium">
                <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
                <input
                  type="date"
                  value={pickupDate}
                  min={todayStr}
                  onChange={(e) => updateDates(e.target.value, returnDate)}
                  className="w-full bg-transparent text-foreground focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Return Date
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-medium">
                <CalendarIcon className="h-4 w-4 shrink-0 text-primary" />
                <input
                  type="date"
                  value={returnDate}
                  min={pickupDate}
                  onChange={(e) => updateDates(pickupDate, e.target.value)}
                  className="w-full bg-transparent text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>
              ${pricePerDay} x {calculatedDays} {calculatedDays === 1 ? "day" : "days"}
            </span>
            <span className="font-medium text-foreground">${rentalTotal}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              Service Fee <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
            </span>
            <span className="font-medium text-foreground">${serviceFee}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Insurance & Taxes</span>
            <span className="font-medium text-foreground">${insuranceTotal}</span>
          </div>

          <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
            <span>Total</span>
            <span>${grandTotal}</span>
          </div>
        </div>

        <button
          disabled={!isAvailable}
          onClick={() => {
            if (isAvailable) {
              alert(`Proceeding to reserve from ${pickupDate} to ${returnDate}`);
            }
          }}
          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition ${
            isAvailable
              ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
              : "cursor-not-allowed bg-muted text-muted-foreground opacity-60"
          }`}
        >
          {isAvailable ? (
            <>
              Reserve Now <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            "Car Currently Occupied"
          )}
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {isAvailable
            ? "You won't be charged yet. Review and confirm on the next step."
            : "Browse other available cars from the listings."}
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="rounded-full bg-accent/50 p-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">{hostName}</h4>
          <p className="text-xs text-muted-foreground">{hostBadge}</p>
        </div>
      </div>
    </div>
  );
}