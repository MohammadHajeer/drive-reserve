"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerReservation } from "@/features/customer/reservations/customer-reservations.schema";
import { useCustomerReservations } from "@/features/customer/reservations/hooks/use-customer-reservations";
import { APP_ROUTES } from "@/lib/routes";
import { parseDateOnly } from "@/lib/reservations/reservation-date";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/domain";

const pageSize = 5;
const statusOptions = [
  "all",
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
  "rejected",
] as const;
type StatusFilter = (typeof statusOptions)[number];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function CustomerReservationsPage() {
  const searchParams = useSearchParams();
  const requestedStatus = searchParams.get("status");
  const initialStatus = isStatusFilter(requestedStatus)
    ? requestedStatus
    : "all";
  const reservationsQuery = useCustomerReservations();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [page, setPage] = useState(1);

  const filteredReservations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return (reservationsQuery.data ?? []).filter((reservation) => {
      const matchesStatus = status === "all" || reservation.status === status;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        reservation.id.toLowerCase().includes(normalizedSearch) ||
        reservation.car.name.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [reservationsQuery.data, search, status]);

  const pageCount = Math.max(1, Math.ceil(filteredReservations.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleReservations = filteredReservations.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateStatus(value: StatusFilter | null) {
    setStatus(value ?? "all");
    setPage(1);
  }

  function exportHistory() {
    const rows = filteredReservations.map((reservation) => [
      reservation.id,
      reservation.car.name,
      reservation.pickupDate,
      reservation.returnDate,
      String(reservation.rentalDays),
      String(reservation.totalPrice),
      reservation.status,
    ]);
    const csv = [
      ["Reservation ID", "Vehicle", "Pickup", "Return", "Days", "Total", "Status"],
      ...rows,
    ]
      .map((row) => row.map(toCsvCell).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "drivereserve-reservations.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track current bookings and review your rental history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!filteredReservations.length}
            onClick={exportHistory}
          >
            <Download aria-hidden="true" />
            Export history
          </Button>
          <Link
            href={APP_ROUTES.cars}
            className={cn(buttonVariants(), "rounded-4xl")}
          >
            <Plus aria-hidden="true" />
            Book a car
          </Link>
        </div>
      </div>

      <Card size="sm">
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Search by reservation ID or vehicle"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={updateStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue>
                {status === "all" ? "All statuses" : capitalize(status)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "all" ? "All statuses" : capitalize(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {reservationsQuery.isPending ? (
        <ReservationsSkeleton />
      ) : reservationsQuery.isError ? (
        <ReservationsError onRetry={() => void reservationsQuery.refetch()} />
      ) : visibleReservations.length === 0 ? (
        <ReservationsEmpty filtered={Boolean(search || status !== "all")} />
      ) : (
        <>
          <div className="space-y-3">
            {visibleReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Page {safePage} of {pageCount}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Previous page"
                disabled={safePage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Next page"
                disabled={safePage === pageCount}
                onClick={() =>
                  setPage((current) => Math.min(pageCount, current + 1))
                }
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ReservationCard({ reservation }: { reservation: CustomerReservation }) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-4 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center">
        <div className="relative flex h-60 items-center justify-center overflow-hidden rounded-2xl bg-muted sm:h-16">
          {reservation.car.imageUrl ? (
            <Image
              src={reservation.car.imageUrl}
              alt={reservation.car.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <CarFront className="size-7 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{reservation.car.name}</p>
            <ReservationStatusBadge status={reservation.status} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {reservation.car.category
              ? capitalize(reservation.car.category)
              : "Rental vehicle"} · Reservation {reservation.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm">
            <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
            {formatDate(reservation.pickupDate)} – {formatDate(reservation.returnDate)}
            <span className="text-muted-foreground">
              ({reservation.rentalDays} {reservation.rentalDays === 1 ? "day" : "days"})
            </span>
          </p>
        </div>

        <p className="text-lg font-bold tabular-nums sm:text-right">
          {priceFormatter.format(reservation.totalPrice)}
        </p>
      </CardContent>
    </Card>
  );
}

function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const variant =
    status === "active" || status === "completed"
      ? "success"
      : status === "cancelled" || status === "rejected"
        ? "destructive"
        : "secondary";

  return <Badge variant={variant}>{capitalize(status)}</Badge>;
}

function ReservationsSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading reservations">
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="h-28" />
      ))}
    </div>
  );
}

function ReservationsError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-destructive/20">
      <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium">We couldn&apos;t load your reservations.</p>
            <p className="text-sm text-muted-foreground">Try again in a moment.</p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

function ReservationsEmpty({ filtered }: { filtered: boolean }) {
  return (
    <Card>
      <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CarFront className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-semibold">
          {filtered ? "No matching reservations" : "No reservations yet"}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {filtered
            ? "Try changing your search or status filter."
            : "When you reserve a car, it will appear here."}
        </p>
        {!filtered && (
          <Link
            href={APP_ROUTES.cars}
            className={cn(buttonVariants(), "mt-5 rounded-4xl")}
          >
            Browse cars
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(date: string) {
  const parsedDate = parseDateOnly(date);

  return parsedDate ? dateFormatter.format(parsedDate) : date;
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function toCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function isStatusFilter(value: string | null): value is StatusFilter {
  return statusOptions.some((option) => option === value);
}
