"use client";

import { UserCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  RecentDashboardCustomer,
} from "@/features/admin/dashboard/admin-dashboard.types";

type Props = {
  customers: RecentDashboardCustomer[];
};

export function RecentCustomers({
  customers,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Customers</CardTitle>

        <CardDescription>
          Newly registered customers.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <UserCircle2 className="size-10 text-muted-foreground" />

                <div>
                  <p className="font-medium">
                    {customer.fullName}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                </div>
              </div>

              <div className="text-right text-sm">
                <p>
                  {customer.totalReservations} reservation
                  {customer.totalReservations > 1 ? "s" : ""}
                </p>

                <p className="text-muted-foreground">
                  {new Date(
                    customer.createdAt
                  ).toLocaleDateString("en-US")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}