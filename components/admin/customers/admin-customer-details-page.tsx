"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Mail,
  Phone,
  ReceiptText,
  WalletCards,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { AdminCustomerReservation } from "@/features/admin/customers/admin-customer.types";
import { useAdminCustomer } from "@/features/admin/customers/hooks/use-admin-customer";
import { AdminCustomerRequestError } from "@/features/admin/customers/services/admin-customer.service";
import { cn } from "@/lib/utils";

import { ReservationStatusBadge } from "../reservations/reservation-status-badge";
import {
  CustomerDetailsLoadingSkeleton,
  CustomerNotFoundState,
  CustomersErrorState,
} from "./customers-states";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const date = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function displayName(fullName: string) {
  return fullName.trim() || "Unnamed customer";
}

export function AdminCustomerDetailsPage({
  customerId,
}: {
  customerId: string;
}) {
  const query = useAdminCustomer(customerId);

  if (!query.isValidCustomerId) return <CustomerNotFoundState />;
  if (query.isLoading) return <CustomerDetailsLoadingSkeleton />;
  if (
    query.isError &&
    query.error instanceof AdminCustomerRequestError &&
    (query.error.code === "CUSTOMER_NOT_FOUND" ||
      query.error.code === "INVALID_CUSTOMER_ID")
  ) {
    return <CustomerNotFoundState />;
  }
  if (query.isError) {
    return (
      <CustomersErrorState
        message={query.error.message}
        onRetry={() => query.refetch()}
      />
    );
  }
  if (!query.data) return <CustomerNotFoundState />;

  const details = query.data;
  const customer = details.customer;
  const statistics = details.statistics;
  const name = displayName(customer.fullName);
  const stats = [
    {
      label: "Reservations",
      value: statistics.totalReservations,
      icon: ReceiptText,
    },
    {
      label: "Active rentals",
      value: statistics.activeReservations,
      icon: CalendarDays,
    },
    {
      label: "Completed",
      value: statistics.completedReservations,
      icon: CheckCircle2,
    },
    {
      label: "Cancelled",
      value: statistics.cancelledReservations,
      icon: XCircle,
    },
    {
      label: "Total spent",
      value: money.format(statistics.totalSpent),
      icon: WalletCards,
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/customers"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "-ml-3 inline-flex",
        )}
      >
        <ArrowLeft className="size-4" />
        Back to customers
      </Link>

      <div>
        <p className="text-sm font-semibold text-primary">Customer profile</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{name}</h1>
        <p className="mt-2 text-muted-foreground">
          Account and rental activity overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <Icon className="size-5 text-primary" />
              <p className="mt-4 text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              {customer.email ?? "Email not available"}
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Phone className="size-4 text-muted-foreground" />
              {customer.phone ?? "Phone not provided"}
            </p>

            <Separator />

            <div className="grid gap-3 text-sm">
              <Detail label="Role" value={customer.role} capitalize />
              <Detail
                label="Joined"
                value={date.format(new Date(customer.createdAt))}
              />
              <Detail
                label="Last updated"
                value={date.format(new Date(customer.updatedAt))}
              />
              <Detail label="Customer ID" value={customer.id} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ReservationSection
            title="Current rentals"
            emptyMessage="This customer has no active rentals."
            reservations={details.currentReservations}
          />
          <ReservationSection
            title="Upcoming reservations"
            emptyMessage="This customer has no pending or confirmed reservations."
            reservations={details.upcomingReservations}
          />
          <ReservationSection
            title="Reservation history"
            emptyMessage="This customer has no completed, cancelled, or rejected reservations."
            reservations={details.reservationHistory}
          />
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex min-w-0 justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={cn(
          "min-w-0 break-all text-right",
          capitalize && "capitalize",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ReservationSection({
  title,
  emptyMessage,
  reservations,
}: {
  title: string;
  emptyMessage: string;
  reservations: AdminCustomerReservation[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          {title}
          <Badge variant="secondary">{reservations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <div className="space-y-3">
            {reservations.map((reservation) => {
              const carName =
                reservation.car.brand && reservation.car.model
                  ? `${reservation.car.brand} ${reservation.car.model}`
                  : "Vehicle unavailable";

              return (
                <div
                  key={reservation.id}
                  className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{carName}</p>
                      <ReservationStatusBadge status={reservation.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {date.format(new Date(reservation.pickupDate))} –{" "}
                      {date.format(new Date(reservation.returnDate))} ·{" "}
                      {reservation.rentalDays}{" "}
                      {reservation.rentalDays === 1 ? "day" : "days"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-semibold">
                      {money.format(reservation.totalPrice)}
                    </span>
                    <Link
                      href={`/admin/reservations/${reservation.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
