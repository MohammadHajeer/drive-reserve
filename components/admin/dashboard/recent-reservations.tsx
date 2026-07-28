"use client";

import { CalendarX2, Eye } from "lucide-react";
import Link from "next/link";

import { ReservationStatusBadge } from "@/components/admin/reservations/reservation-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentDashboardReservation } from "@/features/admin/dashboard/admin-dashboard.types";

import {
  formatCurrency,
  formatDateOnly,
  formatReservationReference,
} from "./dashboard-formatters";

export function RecentReservations({
  reservations,
}: {
  reservations: RecentDashboardReservation[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent reservations</CardTitle>
        <CardDescription>Latest reservation activity.</CardDescription>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        {reservations.length > 0 ? (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Reference</th>
                <th>Customer</th>
                <th>Car</th>
                <th>Rental dates</th>
                <th>Status</th>
                <th className="text-right">Total</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="border-b last:border-0">
                  <td className="py-4 font-medium">
                    {formatReservationReference(reservation.id)}
                  </td>
                  <td>{reservation.customerName}</td>
                  <td>{reservation.carName}</td>
                  <td className="whitespace-nowrap text-muted-foreground">
                    {formatDateOnly(reservation.pickupDate)} – {formatDateOnly(reservation.returnDate)}
                  </td>
                  <td><ReservationStatusBadge status={reservation.status} /></td>
                  <td className="text-right font-medium tabular-nums">
                    {formatCurrency(reservation.totalAmount)}
                  </td>
                  <td className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`View reservation ${formatReservationReference(reservation.id)}`}
                      render={<Link href={`/admin/reservations/${reservation.id}`} />}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <CalendarX2 className="size-9 text-muted-foreground" />
            <p className="mt-3 font-medium">No reservations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New reservations will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
