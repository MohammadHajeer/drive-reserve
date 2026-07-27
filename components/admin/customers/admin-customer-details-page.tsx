"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Mail,
  Phone,
  ReceiptText,
  ShieldAlert,
  WalletCards,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type {
  CustomerStatus,
} from "@/features/admin/customers/admin-customer.types";

import { useAdminCustomer } from "@/features/admin/customers/hooks/use-admin-customer";
import { useUpdateAdminCustomerStatus } from "@/features/admin/customers/hooks/use-update-admin-customer-status";

import { CustomerStatusBadge } from "./customer-status-badge";
import { CustomerStatusDialog } from "./customer-status-dialog";
import {
  CustomersErrorState,
  CustomersLoadingSkeleton,
} from "./customers-states";

export function AdminCustomerDetailsPage({
  customerId,
}: {
  customerId: string;
}) {
  const router = useRouter();

  const query = useAdminCustomer(customerId);
  const mutation = useUpdateAdminCustomerStatus();

  const [open, setOpen] = useState(false);

  const customer = query.data;

  const nextStatus: CustomerStatus =
    customer?.status === "active"
      ? "suspended"
      : "active";

  async function confirm() {
    if (!customer) return;

    try {
      await mutation.mutateAsync({
        customerId,
        status: nextStatus,
      });

      toast.success(
        nextStatus === "suspended"
          ? "Customer suspended."
          : "Customer reactivated."
      );

      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update customer."
      );
    }
  }

  if (query.isPending) {
    return <CustomersLoadingSkeleton />;
  }

  if (query.isError) {
    return (
      <CustomersErrorState
        message={query.error.message}
        onRetry={() => query.refetch()}
      />
    );
  }

  if (!customer) return null;

  const stats = [
    {
      label: "Reservations",
      value: customer.totalReservations,
      icon: ReceiptText,
    },
    {
      label: "Active rentals",
      value: customer.activeReservations,
      icon: CalendarDays,
    },
    {
      label: "Completed",
      value: customer.completedReservations,
      icon: CheckCircle2,
    },
    {
      label: "Cancelled",
      value: customer.cancelledReservations,
      icon: XCircle,
    },
    {
      label: "Total spent",
      value: `$${customer.totalSpent.toLocaleString("en-US")}`,
      icon: WalletCards,
    },
  ];

  return (
    <div className="space-y-6">

      <Button
        variant="ghost"
        className="-ml-3"
        onClick={() => router.push("/admin/customers")}
      >
        <ArrowLeft className="size-4" />
        Back to customers
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">
            Customer profile
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {customer.fullName}
          </h1>

          <p className="mt-2 text-muted-foreground">
            Account and rental activity overview.
          </p>
        </div>

        <Button
          variant={
            customer.status === "active"
              ? "destructive"
              : "default"
          }
          onClick={() => setOpen(true)}
        >
          {customer.status === "active" ? (
            <ShieldAlert className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}

          {customer.status === "active"
            ? "Suspend customer"
            : "Reactivate customer"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <Icon className="size-5 text-primary" />

              <p className="mt-4 text-2xl font-bold">
                {value}
              </p>

              <p className="text-sm text-muted-foreground">
                {label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.8fr]">

        <Card>
          <CardHeader>
            <CardTitle>
              Profile information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Status
              </span>

              <CustomerStatusBadge
                status={customer.status}
              />
            </div>

            <Separator />

            <p className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              {customer.email}
            </p>

            <p className="flex items-center gap-2 text-sm">
              <Phone className="size-4 text-muted-foreground" />
              {customer.phone}
            </p>

            <Separator />

            <div className="grid gap-3 text-sm">

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Role
                </span>

                <span className="capitalize">
                  {customer.role}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Joined
                </span>

                <span>
                  {new Date(
                    customer.createdAt
                  ).toLocaleDateString("en-US")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Last updated
                </span>

                <span>
                  {new Date(
                    customer.updatedAt
                  ).toLocaleDateString("en-US")}
                </span>
              </div>

            </div>

          </CardContent>
        </Card>

                <Card>
          <CardHeader>
            <CardTitle>Reservation history</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {customer.reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {reservation.car}
                      </p>

                      <Badge
                        variant="outline"
                        className="capitalize"
                      >
                        {reservation.status}
                      </Badge>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {reservation.reference} ·{" "}
                      {new Date(
                        reservation.pickupDate
                      ).toLocaleDateString("en-US")}{" "}
                      –{" "}
                      {new Date(
                        reservation.returnDate
                      ).toLocaleDateString("en-US")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      $
                      {reservation.totalAmount.toLocaleString(
                        "en-US"
                      )}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/admin/reservations/${reservation.id}`
                        )
                      }
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <CustomerStatusDialog
        customer={customer}
        status={nextStatus}
        open={open}
        busy={mutation.isPending}
        onOpenChange={setOpen}
        onConfirm={confirm}
      />
    </div>
  );
}