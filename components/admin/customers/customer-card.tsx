import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Mail,
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

import type {
  AdminCustomer,
  CustomerStatus,
} from "@/features/admin/customers/admin-customer.types";

import { CustomerStatusBadge } from "./customer-status-badge";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function CustomerCard({
  customer,
  onStatusChange,
}: {
  customer: AdminCustomer;
  onStatusChange: (
    customer: AdminCustomer,
    status: CustomerStatus
  ) => void;
}) {
  const router = useRouter();

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex-row items-start justify-between space-y-0 border-b bg-muted/30">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {initials(customer.fullName)}
          </span>

          <div className="min-w-0">
            <p className="truncate font-semibold">{customer.fullName}</p>

            <p className="text-xs text-muted-foreground">
              Member since{" "}
              {new Date(customer.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <CustomerStatusBadge status={customer.status} />

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Customer actions</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/customers/${customer.id}`)
                }
              >
                View profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  onStatusChange(
                    customer,
                    customer.status === "active"
                      ? "suspended"
                      : "active"
                  )
                }
              >
                {customer.status === "active"
                  ? "Suspend account"
                  : "Reactivate account"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5">
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2 truncate">
            <Mail className="size-4 text-muted-foreground" />
            {customer.email}
          </p>

          <p className="flex items-center gap-2">
            <Phone className="size-4 text-muted-foreground" />
            {customer.phone}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center">
          <div>
            <ReceiptText className="mx-auto size-4 text-muted-foreground" />
            <p className="mt-1 font-semibold">
              {customer.totalReservations}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Bookings
            </p>
          </div>

          <div>
            <CalendarDays className="mx-auto size-4 text-muted-foreground" />
            <p className="mt-1 font-semibold">
              {customer.activeReservations}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Active
            </p>
          </div>

          <div>
            <WalletCards className="mx-auto size-4 text-muted-foreground" />
            <p className="mt-1 font-semibold">
              ${customer.totalSpent.toLocaleString("en-US")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Spent
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t p-4">
        <Button
          className="w-full"
          onClick={() =>
            router.push(`/admin/customers/${customer.id}`)
          }
        >
          View customer profile
        </Button>
      </CardFooter>
    </Card>
  );
}