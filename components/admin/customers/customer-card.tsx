"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  MoreHorizontal,
  Phone,
  ReceiptText,
  UserRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminCustomerListItem } from "@/features/admin/customers/admin-customer.types";
import { cn } from "@/lib/utils";

const moneyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const memberSinceFormatter = new Intl.DateTimeFormat("en-GB", {
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

function formatMemberSince(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Join date unavailable";
  }

  return `Member since ${memberSinceFormatter.format(date)}`;
}

type CustomerMetricProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  highlight?: boolean;
};

function CustomerMetric({
  icon: Icon,
  label,
  value,
  highlight = false,
}: CustomerMetricProps) {
  return (
    <div className="min-w-0 px-2 py-3 text-center">
      <div
        className={cn(
          "mx-auto flex size-7 items-center justify-center rounded-md",
          highlight
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-3.5" />
      </div>

      <dd
        title={String(value)}
        className="mt-1.5 truncate text-sm font-semibold tabular-nums text-foreground"
      >
        {value}
      </dd>

      <dt className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
        {label}
      </dt>
    </div>
  );
}

type CustomerCardProps = {
  customer: AdminCustomerListItem;
};

export function CustomerCard({ customer }: CustomerCardProps) {
  const name = displayName(customer.fullName);
  const customerUrl = `/admin/customers/${customer.id}`;
  const phone = customer.phone?.trim() || "Phone not provided";

  return (
    <Card className="group overflow-hidden border-border/70 py-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="h-0.5 bg-primary" />

      <div className="flex items-start justify-between gap-3 border-b bg-muted/20 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-primary/15 bg-primary/10 text-xs font-bold text-primary shadow-sm">
            {initials(customer.fullName)}
          </div>

          <div className="min-w-0">
            <Link
              href={customerUrl}
              className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {name}
            </Link>

            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 shrink-0" />

              <span className="truncate">
                {formatMemberSince(customer.createdAt)}
              </span>
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Open actions for ${name}`}
                className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            }
          />

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              render={
                <Link href={customerUrl}>
                  <UserRound className="size-4" />
                  View profile
                </Link>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2.5 rounded-lg border bg-muted/20 p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground shadow-xs">
            <Phone className="size-3.5" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Contact number
            </p>

            <p className="truncate text-sm font-medium text-foreground">
              {phone}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-3 divide-x overflow-hidden rounded-lg border bg-muted/20">
          <CustomerMetric
            icon={ReceiptText}
            label="Bookings"
            value={customer.totalReservations}
          />

          <CustomerMetric
            icon={CalendarDays}
            label="Active"
            value={customer.activeReservations}
            highlight={customer.activeReservations > 0}
          />

          <CustomerMetric
            icon={WalletCards}
            label="Total spent"
            value={moneyFormatter.format(customer.totalSpent)}
          />
        </dl>
      </CardContent>

      <CardFooter className="border-t bg-muted/20 p-3">
        <Link
          href={customerUrl}
          className={cn(
            buttonVariants({
              variant: "default",
              size: "sm",
            }),
            "h-9 w-full gap-2",
          )}
        >
          View customer profile
          <ArrowUpRight className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}