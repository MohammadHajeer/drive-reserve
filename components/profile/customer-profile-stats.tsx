"use client";

import Link from "next/link";
import { AlertCircle, CarFront, CheckCircle2, Clock3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerProfileStats } from "@/features/customer/profile/hooks/use-customer-profile-stats";
import { APP_ROUTES } from "@/lib/routes";

const statDefinitions = [
  {
    key: "totalRentals",
    label: "Total rentals",
    icon: CarFront,
    href: APP_ROUTES.customerReservations,
  },
  {
    key: "activeRentals",
    label: "Active rentals",
    icon: Clock3,
    href: `${APP_ROUTES.customerReservations}?status=active`,
  },
  {
    key: "completedRentals",
    label: "Completed rentals",
    icon: CheckCircle2,
    href: `${APP_ROUTES.customerReservations}?status=completed`,
  },
] as const;

export function CustomerProfileStats() {
  const statsQuery = useCustomerProfileStats();

  if (statsQuery.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-3" aria-label="Loading rental statistics">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-28" />
        ))}
      </div>
    );
  }

  if (statsQuery.isError) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          Rental statistics are temporarily unavailable.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {statDefinitions.map((stat) => {
        const Icon = stat.icon;

        return (
          <Link key={stat.key} href={stat.href} className="group">
            <Card className="h-full transition-transform group-hover:-translate-y-0.5">
              <CardContent className="flex items-center gap-4">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums">
                    {statsQuery.data[stat.key]}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

