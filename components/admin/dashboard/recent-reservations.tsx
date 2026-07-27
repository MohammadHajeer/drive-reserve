"use client";

import { Eye } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type {
  RecentDashboardReservation,
} from "@/features/admin/dashboard/admin-dashboard.types";

type Props = {
  reservations: RecentDashboardReservation[];
};

const statusVariant: Record<
  RecentDashboardReservation["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  approved: "default",
  pending: "secondary",
  completed: "outline",
  cancelled: "destructive",
  rejected: "destructive",
};

export function RecentReservations({
  reservations,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reservations</CardTitle>

        <CardDescription>
          Latest reservation activity.
        </CardDescription>
      </CardHeader>

      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-3">Reference</th>
              <th>Customer</th>
              <th>Car</th>
              <th>Status</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((reservation) => (
              <tr
                key={reservation.id}
                className="border-b last:border-0"
              >
                <td className="py-4 font-medium">
                  {reservation.reference}
                </td>

                <td>{reservation.customerName}</td>

                <td>{reservation.carName}</td>

                <td>
                  <Badge variant={statusVariant[reservation.status]}>
                    {reservation.status}
                  </Badge>
                </td>

                <td>
                  {reservation.totalAmount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </td>

                <td className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <Eye className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}