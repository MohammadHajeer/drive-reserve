"use client";

import { UserCircle2, Users } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentDashboardCustomer } from "@/features/admin/dashboard/admin-dashboard.types";

export function RecentCustomers({
  customers,
}: {
  customers: RecentDashboardCustomer[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent customers</CardTitle>
        <CardDescription>Newly registered customers.</CardDescription>
      </CardHeader>

      <CardContent>
        {customers.length > 0 ? (
          <div className="space-y-4">
            {customers.map((customer) => (
              <Link
                key={customer.id}
                href={`/admin/customers/${customer.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <UserCircle2 className="size-10 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{customer.fullName}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {customer.email ?? "Email unavailable"}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right text-sm">
                  <p>
                    {customer.totalReservations} reservation
                    {customer.totalReservations === 1 ? "" : "s"}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(customer.createdAt).toLocaleDateString("en-US")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex min-h-60 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <Users className="size-9 text-muted-foreground" />
            <p className="mt-3 font-medium">No customers yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Newly registered customers will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
