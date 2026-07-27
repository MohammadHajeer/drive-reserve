"use client";

import React from "react";
import Link from "next/link";
import { Printer, Share2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CustomerReservation } from "@/features/customer/reservations/customer-reservations.schema";
import type { ReservationStatus } from "@/types/domain";

export function ReservationHeader({ reservation }: { reservation: CustomerReservation }) {
  const status = reservation.status;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Reservation Details</h1>
          <StatusBadge status={status} />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {getStatusDescription(status)}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0 print:hidden">
        <Button
          variant="outline"
          size="lg"
          className="h-11 px-5 text-sm font-semibold rounded-xl"
          onClick={handlePrint}
        >
          <Printer className="size-4 mr-2" /> Print Receipt
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="h-11 px-5 text-sm font-semibold rounded-xl"
        >
          <Share2 className="size-4 mr-2" /> Share
        </Button>

        {(status === "confirmed" || status === "pending") && (
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-5 text-sm font-semibold rounded-xl border-2 border-destructive text-destructive hover:bg-destructive/10"
          >
            <AlertCircle className="size-4 mr-2" /> Cancel Reservation
          </Button>
        )}
        {status === "active" && (
          <Button
            variant="outline"
            size="lg"
            disabled
            className="h-11 px-5 text-sm font-semibold rounded-xl cursor-not-allowed opacity-60"
          >
            Cancel Unavailable
          </Button>
        )}
        {(status === "cancelled" || status === "rejected" || status === "completed") && (
          <Link href="/cars">
            <Button size="lg" className="h-11 px-5 text-sm font-semibold rounded-xl">
              Book Again
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const map: Record<ReservationStatus, { label: string; variant: "success" | "destructive" | "secondary" }> = {
    confirmed: { label: "CONFIRMED", variant: "success" },
    active: { label: "ACTIVE", variant: "success" },
    completed: { label: "COMPLETED", variant: "secondary" },
    cancelled: { label: "CANCELLED", variant: "destructive" },
    rejected: { label: "REJECTED", variant: "destructive" },
    pending: { label: "PENDING", variant: "secondary" },
  };
  const current = map[status] || { label: status.toUpperCase(), variant: "secondary" };
  return <Badge variant={current.variant}>{current.label}</Badge>;
}

function getStatusDescription(status: ReservationStatus) {
  switch (status) {
    case "confirmed": return "Your booking is secured and ready for pick-up.";
    case "active": return "You currently have this vehicle checked out.";
    case "pending": return "Your request has been received and is awaiting review.";
    case "cancelled": return "This reservation has been successfully cancelled.";
    case "rejected": return "This reservation request was declined.";
    case "completed": return "This rental session has concluded.";
    default: return "Viewing booking details.";
  }
}


