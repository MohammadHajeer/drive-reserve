"use client";

import {
  AlertCircle,
  CalendarCheck2,
  CarFront,
  CircleDollarSign,
  RefreshCw,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboard } from "@/features/admin/dashboard/hooks/use-admin-dashboard";

import { DashboardKpiCard } from "./dashboard-kpi-card";
import { formatWholeCurrency } from "./dashboard-formatters";
import { FleetStatusChart } from "./fleet-status-chart";
import { RecentCustomers } from "./recent-customers";
import { RecentReservations } from "./recent-reservations";
import { ReservationsChart } from "./reservations-chart";
import { RevenueChart } from "./revenue-chart";

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="space-y-3 py-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-full max-w-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-5 p-5">
              <Skeleton className="size-10" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-24" />
              </div>
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {["xl:col-span-2", ""].map((className, index) => (
          <Card key={index} className={className}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </CardHeader>
            <CardContent><Skeleton className="h-75 w-full" /></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </CardHeader>
        <CardContent><Skeleton className="h-80 w-full" /></CardContent>
      </Card>
    </div>
  );
}

export function AdminDashboardPage() {
  const dashboardQuery = useAdminDashboard();

  if (dashboardQuery.isPending) return <DashboardSkeleton />;

  if (dashboardQuery.isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex min-h-72 flex-col items-center justify-center p-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Unable to load dashboard</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {dashboardQuery.error.message}
          </p>
          <Button
            type="button"
            className="mt-5"
            onClick={() => dashboardQuery.refetch()}
            disabled={dashboardQuery.isFetching}
          >
            <RefreshCw className={dashboardQuery.isFetching ? "animate-spin" : ""} />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const dashboard = dashboardQuery.data;
  const { kpis } = dashboard;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Business overview</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor your fleet, reservations, customers, and revenue.
          </p>
        </div>

        {dashboardQuery.isFetching ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <RefreshCw className="size-4 animate-spin" /> Updating data
          </p>
        ) : null}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKpiCard
          title="Total cars"
          value={kpis.totalCars.toLocaleString("en-US")}
          description={`${kpis.carsAddedThisMonth} added this month`}
          href="/admin/cars"
          icon={CarFront}
        />
        <DashboardKpiCard
          title="Active reservations"
          value={kpis.activeReservations.toLocaleString("en-US")}
          description={`${kpis.pendingReservations} awaiting approval`}
          href="/admin/reservations"
          icon={CalendarCheck2}
        />
        <DashboardKpiCard
          title="Total customers"
          value={kpis.totalCustomers.toLocaleString("en-US")}
          description={`${kpis.newCustomersThisMonth} joined this month`}
          href="/admin/customers"
          icon={Users}
        />
        <DashboardKpiCard
          title="Monthly revenue"
          value={formatWholeCurrency(kpis.monthlyRevenue)}
          description="compared with last month"
          trend={kpis.revenueGrowthPercentage}
          href="/admin/reservations"
          icon={CircleDollarSign}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart data={dashboard.revenue} growthPercentage={kpis.revenueGrowthPercentage} />
        </div>
        <FleetStatusChart data={dashboard.fleetStatus} />
      </section>

      <section><ReservationsChart data={dashboard.reservations} /></section>

      <section className="grid gap-6 xl:grid-cols-2">
        <RecentReservations reservations={dashboard.recentReservations} />
        <RecentCustomers customers={dashboard.recentCustomers} />
      </section>
    </div>
  );
}
