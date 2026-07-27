"use client";

import {
  CalendarCheck2,
  CarFront,
  CircleDollarSign,
  Users,
} from "lucide-react";

import { DashboardKpiCard } from "./dashboard-kpi-card";
import { FleetStatusChart } from "./fleet-status-chart";
import { ReservationsChart } from "./reservations-chart";
import { RevenueChart } from "./revenue-chart";
import { RecentCustomers } from "./recent-customers";
import { RecentReservations } from "./recent-reservations";

import { useAdminDashboard } from "@/features/admin/dashboard/hooks/use-admin-dashboard";

export function AdminDashboardPage() {
  const dashboardQuery = useAdminDashboard();

  if (dashboardQuery.isPending) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-xl bg-muted" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 h-96 animate-pulse rounded-xl bg-muted" />

          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="h-[420px] animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-semibold">Unable to load dashboard</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {dashboardQuery.error.message}
        </p>

        <button
          type="button"
          className="mt-4 text-sm font-semibold text-primary"
          onClick={() => dashboardQuery.refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  const dashboard = dashboardQuery.data;
  const { kpis } = dashboard;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-primary">
          Business overview
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Monitor your fleet, reservations, customers, and revenue.
        </p>
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
          value={kpis.monthlyRevenue.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })}
          description="Compared with last month"
          trend={`+${kpis.revenueGrowthPercentage}%`}
          href="/admin/reservations"
          icon={CircleDollarSign}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart
            data={dashboard.revenue}
            growthPercentage={kpis.revenueGrowthPercentage}
          />
        </div>

        <FleetStatusChart
          data={dashboard.fleetStatus}
        />
      </section>

      <section>
        <ReservationsChart
          data={dashboard.reservations}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
  <RecentReservations
    reservations={dashboard.recentReservations}
  />

  <RecentCustomers
    customers={dashboard.recentCustomers}
  />
</section>
    </div>
  );
}