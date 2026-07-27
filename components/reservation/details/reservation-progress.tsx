"use client";

import React from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomerReservation } from "@/features/customer/reservations/customer-reservations.schema";

export function ReservationProgress({ reservation }: { reservation: CustomerReservation }) {
  const status = reservation.status;

  // Determine active steps based on status
  const isBookedDone = true;
  const isConfirmedDone = status === "confirmed" || status === "active" || status === "completed";
  const isPickupDone = status === "active" || status === "completed";
  const isReturnDone = status === "completed";

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold">Booking Progress</h2>
          <p className="text-xs text-muted-foreground">Timeline tracking for your rental order.</p>
        </div>

        {/* Visual Progress Timeline Steps matching Image 5 */}
        <div className="relative py-4">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 z-0" />
          
          <div className="relative z-10 grid grid-cols-4 gap-2">
            {/* Step 1: Booked */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${isBookedDone ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
                <Check className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold">BOOKED</p>
                <p className="text-[10px] text-muted-foreground">{reservation.pickupDate ? "Submitted" : ""}</p>
              </div>
            </div>

            {/* Step 2: Confirmed */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${isConfirmedDone ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
                {isConfirmedDone ? <Check className="size-4" /> : "2"}
              </div>
              <div>
                <p className="text-xs font-bold">CONFIRMED</p>
                <p className="text-[10px] text-muted-foreground">{isConfirmedDone ? "Approved" : "Pending"}</p>
              </div>
            </div>

            {/* Step 3: Pick-Up */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${isPickupDone ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
                {isPickupDone ? <Check className="size-4" /> : "3"}
              </div>
              <div>
                <p className="text-xs font-bold">PICK-UP</p>
                <p className="text-[10px] text-muted-foreground">{reservation.pickupDate}</p>
              </div>
            </div>

            {/* Step 4: Return */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`size-8 rounded-full flex items-center justify-center font-bold text-xs ${isReturnDone ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
                {isReturnDone ? <Check className="size-4" /> : "4"}
              </div>
              <div>
                <p className="text-xs font-bold">RETURN</p>
                <p className="text-[10px] text-muted-foreground">{reservation.returnDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/40 border text-xs text-muted-foreground flex justify-between items-center">
          <div>
            <span className="font-semibold text-foreground block">Rental Schedule Summary:</span>
            <span>{reservation.rentalDays} total days ({reservation.pickupDate} to {reservation.returnDate})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}