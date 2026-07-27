"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ReservationCustomerCard } from "./reservation-customer-card";
import type { CustomerReservation } from "@/features/customer/reservations/customer-reservations.schema";

export function ReservationSummary({ reservation }: { reservation: CustomerReservation }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card size="sm">
        <CardContent className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Booking ID</span>
          <p className="text-base font-bold text-foreground">{reservation.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-[10px] text-muted-foreground">Ref: DR-{reservation.id.slice(0, 6).toUpperCase()}</p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Amount</span>
          <p className="text-base font-bold text-foreground">${reservation.totalPrice.toFixed(2)}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Paid / Secured</p>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardContent className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rental Period</span>
          <p className="text-base font-bold text-foreground">{reservation.rentalDays} {reservation.rentalDays === 1 ? "Day" : "Days"}</p>
          <p className="text-[10px] text-muted-foreground">{reservation.pickupDate} - {reservation.returnDate}</p>
        </CardContent>
      </Card>

      <ReservationCustomerCard reservation={reservation} />
    </div>
  );
}