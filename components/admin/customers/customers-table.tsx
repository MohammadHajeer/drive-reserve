"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Phone } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminCustomerListItem } from "@/features/admin/customers/admin-customer.types";
import { cn } from "@/lib/utils";

const moneyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const joinedDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function displayName(fullName: string) {
  return fullName.trim() || "Unnamed customer";
}

function initials(name: string) {
  const value = name.trim();

  if (!value) {
    return "CU";
  }

  return value
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatJoinedDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return joinedDateFormatter.format(date);
}

type CustomersTableProps = {
  customers: AdminCustomerListItem[];
};

export function CustomersTable({ customers }: CustomersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-60 pl-5">Customer</TableHead>

              <TableHead className="min-w-44">Contact</TableHead>

              <TableHead className="text-center">Bookings</TableHead>

              <TableHead className="text-center">Active</TableHead>

              <TableHead className="text-right">Total spent</TableHead>

              <TableHead className="min-w-36">Joined</TableHead>

              <TableHead className="w-16 pr-5 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {customers.map((customer) => {
              const name = displayName(customer.fullName);
              const customerUrl = `/admin/customers/${customer.id}`;

              return (
                <TableRow key={customer.id} className="group">
                  <TableCell className="pl-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/15 bg-primary/10 text-xs font-bold text-primary">
                        {initials(customer.fullName)}
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={customerUrl}
                          className="block max-w-48 truncate font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {name}
                        </Link>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Customer profile
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="size-3.5 shrink-0 text-muted-foreground" />

                      <span
                        className={cn(
                          "max-w-36 truncate",
                          !customer.phone && "text-muted-foreground",
                        )}
                      >
                        {customer.phone?.trim() || "Not provided"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center font-medium tabular-nums">
                    {customer.totalReservations}
                  </TableCell>

                  <TableCell className="text-center">
                    <span
                      className={cn(
                        "inline-flex min-w-8 justify-center rounded-full px-2 py-1 text-xs font-semibold tabular-nums",
                        customer.activeReservations > 0
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {customer.activeReservations}
                    </span>
                  </TableCell>

                  <TableCell className="text-right font-medium tabular-nums">
                    {moneyFormatter.format(customer.totalSpent)}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="size-3.5 shrink-0" />
                      {formatJoinedDate(customer.createdAt)}
                    </div>
                  </TableCell>

                  <TableCell className="pr-5 text-right">
                    <Link
                      href={customerUrl}
                      aria-label={`View ${name}'s profile`}
                      className={cn(
                        buttonVariants({
                          variant: "ghost",
                          size: "icon-sm",
                        }),
                        "text-muted-foreground hover:text-primary",
                      )}
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
