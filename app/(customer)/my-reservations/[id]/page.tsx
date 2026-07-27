"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCustomerReservations } from "@/features/customer/reservations/hooks/use-customer-reservations";

// Import modular components
import { ReservationHeader } from "@/components/reservation/details/reservation-header";
import { ReservationSummary } from "@/components/reservation/details/reservation-summary";
import { ReservationProgress } from "@/components/reservation/details/reservation-progress";
import { ReservationVehicleCard } from "@/components/reservation/details/reservation-vehicle-card";
import { ReservationItineraryCard } from "@/components/reservation/details/reservation-itinerary-card";
import { ReservationPaymentCard } from "@/components/reservation/details/reservation-payment-card";
import { ReservationDriverInfoCard } from "@/components/reservation/details/reservation-driver-info-card";

export default function ReservationDetailsPage() {
  const params = useParams();
  const reservationId = params?.id as string;
  
  const reservationsQuery = useCustomerReservations();
  const reservation = (reservationsQuery.data ?? []).find(
    (res) => res.id.toLowerCase() === reservationId?.toLowerCase()
  );

  if (reservationsQuery.isPending) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Reservation not found</h1>
        <p className="text-sm text-muted-foreground">The reservation you are looking for does not exist.</p>
        <Link href="/my-reservations">
          <Button variant="outline">Back to My Reservations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Link
          href="/my-reservations"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Reservations
        </Link>
      </div>

      {/* 1. Header with Status Badge & Actions */}
      <ReservationHeader reservation={reservation} />

      {/* 2. Top Summary Cards (Booking ID, Total Amount, Rental Period, Customer) */}
      <ReservationSummary reservation={reservation} />

      {/* 3. Booking Progress Timeline Bar right below summary */}
      <ReservationProgress reservation={reservation} />

      {/* 4. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ReservationVehicleCard car={reservation.car} />
          <ReservationItineraryCard reservation={reservation} />
        </div>

        <div className="space-y-6">
          <ReservationPaymentCard reservation={reservation} />
          <ReservationDriverInfoCard />
        </div>
      </div>
    </div>
  );
}