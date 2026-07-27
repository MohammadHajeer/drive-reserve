"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CustomerReservation } from "@/features/customer/reservations/customer-reservations.schema";

export function ReservationCustomerCard({ reservation }: { reservation: CustomerReservation }) {
  const customerName = (reservation as any).customerName || "Sarah Jenkins";

  return (
    <Card size="sm">
      <CardContent className="p-4 space-y-1">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Customer</span>
        <p className="text-base font-bold text-foreground">{customerName}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5">
          <UserCheck className="size-3 text-emerald-600" /> Verified Driver
        </p>
      </CardContent>
    </Card>
  );
}