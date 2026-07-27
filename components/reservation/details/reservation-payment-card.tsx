"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomerReservation } from "@/features/customer/reservations/customer-reservations.schema";
import type { ReservationStatus } from "@/types/domain";

export function ReservationPaymentCard({ reservation }: { reservation: CustomerReservation }) {
  const status = reservation.status;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold">Payment Summary</h2>
          <p className="text-xs text-muted-foreground">Financial breakdown.</p>
        </div>

        <div className="space-y-3 pt-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-medium text-foreground">${reservation.totalPrice.toFixed(2)}</span>
          </div>

          <div className="border-t pt-3 flex justify-between items-center">
            <span className="font-bold text-foreground">Total Amount</span>
            <span className="text-lg font-bold text-primary">${reservation.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg border text-xs space-y-1">
          <span className="text-muted-foreground block font-medium">Payment Status Note:</span>
          <PaymentStatusNote status={status} />
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentStatusNote({ status }: { status: ReservationStatus }) {
  if (status === "pending") {
    return <p className="text-amber-600 font-semibold">Payment pending approval (No charges made yet).</p>;
  }
  if (status === "cancelled" || status === "rejected") {
    return <p className="text-muted-foreground">No charge / Full refund issued to original method.</p>;
  }
  if (status === "active" || status === "confirmed") {
    return <p className="text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Paid Successfully</p>;
  }
  return <p className="text-muted-foreground">Completed and settled.</p>;
}