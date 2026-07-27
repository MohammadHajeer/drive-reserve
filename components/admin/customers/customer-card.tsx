"use client";

import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MoreHorizontal,
  Phone,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminCustomerListItem } from "@/features/admin/customers/admin-customer.types";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function displayName(fullName: string) {
  return fullName.trim() || "Unnamed customer";
}

function initials(name: string) {
  const value = name.trim();
  if (!value) return "CU";

  return value
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CustomerCard({
  customer,
}: {
  customer: AdminCustomerListItem;
}) {
  const router = useRouter();
  const name = displayName(customer.fullName);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-start justify-between space-y-0 border-b bg-muted/30">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {initials(customer.fullName)}
          </span>

          <div className="min-w-0">
            <p className="truncate font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">
              Member since{" "}
              {new Date(customer.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              })}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Customer actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/admin/customers/${customer.id}`)}
            >
              View profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        <p className="flex items-center gap-2 text-sm">
          <Phone className="size-4 text-muted-foreground" />
          {customer.phone ?? "Phone not provided"}
        </p>

        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center">
          <div>
            <ReceiptText className="mx-auto size-4 text-muted-foreground" />
            <p className="mt-1 font-semibold">{customer.totalReservations}</p>
            <p className="text-[11px] text-muted-foreground">Bookings</p>
          </div>

          <div>
            <CalendarDays className="mx-auto size-4 text-muted-foreground" />
            <p className="mt-1 font-semibold">{customer.activeReservations}</p>
            <p className="text-[11px] text-muted-foreground">Active</p>
          </div>

          <div>
            <WalletCards className="mx-auto size-4 text-muted-foreground" />
            <p className="mt-1 font-semibold">
              {money.format(customer.totalSpent)}
            </p>
            <p className="text-[11px] text-muted-foreground">Spent</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t p-4">
        <Button
          className="w-full"
          onClick={() => router.push(`/admin/customers/${customer.id}`)}
        >
          View customer profile
        </Button>
      </CardFooter>
    </Card>
  );
}
