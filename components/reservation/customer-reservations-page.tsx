"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  List,
  Plus,
  Search,
} from "lucide-react";

import { ReservationStatusBadge } from "@/components/reservation/reservation-status-badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CustomerReservation } from "@/features/customer/reservations/customer-reservations.schema";
import { useCustomerReservations } from "@/features/customer/reservations/hooks/use-customer-reservations";
import { parseDateOnly } from "@/lib/reservations/reservation-date";
import { APP_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
type ReservationsView = "table" | "cards";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const priceFormatter = new Intl.NumberFormat("en-GB", {
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
  const [view, setView] = useState<ReservationsView>("table");
  const [page, setPage] = useState(1);

  const filteredReservations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return (reservationsQuery.data ?? []).filter((reservation) => {
      const matchesStatus = status === "all" || reservation.status === status;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        reservation.id.toLowerCase().includes(normalizedSearch) ||
        reservation.car.name.toLowerCase().includes(normalizedSearch) ||
        reservation.car.category?.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [reservationsQuery.data, search, status]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredReservations.length / pageSize),
  );

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
      [
        "Reservation ID",
        "Vehicle",
        "Pickup",
        "Return",
        "Days",
        "Total",
        "Status",
      ],
      ...rows,
    ]
      .map((row) => row.map(toCsvCell).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], {
        type: "text/csv",
      }),
    );

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
        <ReservationsSkeleton view={view} />
      ) : reservationsQuery.isError ? (
        <ReservationsError onRetry={() => void reservationsQuery.refetch()} />
      ) : visibleReservations.length === 0 ? (
        <ReservationsEmpty filtered={Boolean(search || status !== "all")} />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Reservation history</h2>

              <p className="text-sm text-muted-foreground">
                {filteredReservations.length}{" "}
                {filteredReservations.length === 1
                  ? "reservation"
                  : "reservations"}{" "}
                found
              </p>
            </div>

            <div
              role="group"
              aria-label="Reservation display layout"
              className="inline-flex w-fit items-center rounded-lg border bg-muted/30 p-1"
            >
              <Button
                type="button"
                size="sm"
                variant={view === "table" ? "default" : "ghost"}
                aria-pressed={view === "table"}
                onClick={() => setView("table")}
                className="h-8 gap-2 px-3"
              >
                <List className="size-4" />
                Table
              </Button>

              <Button
                type="button"
                size="sm"
                variant={view === "cards" ? "default" : "ghost"}
                aria-pressed={view === "cards"}
                onClick={() => setView("cards")}
                className="h-8 gap-2 px-3"
              >
                <LayoutGrid className="size-4" />
                Cards
              </Button>
            </div>
          </div>

          {view === "table" ? (
            <ReservationsTable reservations={visibleReservations} />
          ) : (
            <div className="space-y-3">
              {visibleReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                />
              ))}
            </div>
          )}

          <ReservationsPagination
            page={safePage}
            pageCount={pageCount}
            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() =>
              setPage((current) => Math.min(pageCount, current + 1))
            }
          />
        </div>
      )}
    </div>
  );
}

function ReservationsTable({
  reservations,
}: {
  reservations: readonly CustomerReservation[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table className="min-w-230">
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-auto min-w-64 px-5 py-4">
                Vehicle
              </TableHead>

              <TableHead className="h-auto px-5 py-4">Reservation</TableHead>

              <TableHead className="h-auto min-w-64 px-5 py-4">
                Rental period
              </TableHead>

              <TableHead className="h-auto px-5 py-4 text-center">
                Days
              </TableHead>

              <TableHead className="h-auto px-5 py-4 text-right">
                Total
              </TableHead>

              <TableHead className="h-auto px-5 py-4">Status</TableHead>

              <TableHead className="h-auto w-16 px-5 py-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {reservations.map((reservation) => {
              const reservationHref = `/my-reservations/${reservation.id}`;

              const reservationCode = reservation.id.slice(0, 8).toUpperCase();

              return (
                <TableRow key={reservation.id} className="group">
                  <TableCell className="px-5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Link
                        href={reservationHref}
                        className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted"
                      >
                        {reservation.car.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={reservation.car.imageUrl}
                            alt={reservation.car.name}
                            sizes="80px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            <CarFront
                              className="size-5 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </Link>

                      <div className="min-w-0">
                        <Link
                          href={reservationHref}
                          className="block max-w-52 truncate font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          {reservation.car.name}
                        </Link>

                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {reservation.car.category
                            ? capitalize(reservation.car.category)
                            : "Rental vehicle"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-3">
                    <span
                      title={reservation.id}
                      className="inline-flex rounded-md border bg-muted/50 px-2 py-1 font-mono text-xs font-medium"
                    >
                      #{reservationCode}
                    </span>
                  </TableCell>

                  <TableCell className="whitespace-nowrap px-5 py-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />

                      <span className="text-sm text-muted-foreground">
                        {formatDate(reservation.pickupDate)}
                        <span className="mx-1.5">–</span>
                        {formatDate(reservation.returnDate)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-5 py-3 text-center font-medium tabular-nums">
                    {reservation.rentalDays}
                  </TableCell>

                  <TableCell className="whitespace-nowrap px-5 py-3 text-right font-semibold tabular-nums">
                    {priceFormatter.format(reservation.totalPrice)}
                  </TableCell>

                  <TableCell className="px-5 py-3">
                    <ReservationStatusBadge status={reservation.status} />
                  </TableCell>

                  <TableCell className="px-5 py-3 text-right">
                    <Link
                      href={reservationHref}
                      aria-label={`View reservation ${reservationCode}`}
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

function ReservationCard({
  reservation,
}: {
  reservation: CustomerReservation;
}) {
  const reservationHref = `/my-reservations/${reservation.id}`;

  const reservationCode = reservation.id.slice(0, 8).toUpperCase();

  const rentalDaysLabel = `${reservation.rentalDays} ${
    reservation.rentalDays === 1 ? "day" : "days"
  }`;

  return (
    <Link
      href={reservationHref}
      aria-label={`View reservation ${reservationCode} for ${reservation.car.name}`}
      className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card
        size="sm"
        className="overflow-hidden border-border/70 py-0 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/35 group-hover:shadow-md"
      >
        <CardContent className="grid gap-4 p-3 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center sm:p-4">
          <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted sm:h-24 sm:w-36 sm:aspect-auto">
            {reservation.car.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={reservation.car.imageUrl}
                alt={reservation.car.name}
                sizes="(max-width: 639px) calc(100vw - 3rem), 144px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <CarFront
                  className="size-7 text-muted-foreground"
                  aria-hidden="true"
                />

                <span className="sr-only">No vehicle image available</span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                {reservation.car.name}
              </h2>

              <ReservationStatusBadge status={reservation.status} />
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>
                {reservation.car.category
                  ? capitalize(reservation.car.category)
                  : "Rental vehicle"}
              </span>

              <span aria-hidden="true">•</span>

              <span className="font-mono">#{reservationCode}</span>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2">
              <CalendarDays
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />

              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {formatDate(reservation.pickupDate)}

                  <span className="mx-1.5 text-muted-foreground">–</span>

                  {formatDate(reservation.returnDate)}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {rentalDaysLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between border-t pt-3 sm:h-full sm:min-w-32 sm:flex-col sm:items-end sm:justify-between sm:border-l sm:border-t-0 sm:py-1 sm:pl-5">
            <div className="sm:text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Total price
              </p>

              <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                {priceFormatter.format(reservation.totalPrice)}
              </p>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              View details
              <ArrowUpRight
                className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ReservationsPagination({
  page,
  pageCount,
  onPrevious,
  onNext,
}: {
  page: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={onPrevious}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={page === pageCount}
          onClick={onNext}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function ReservationsSkeleton({ view }: { view: ReservationsView }) {
  if (view === "table") {
    return (
      <div
        className="overflow-hidden rounded-xl border"
        aria-label="Loading reservations"
      >
        <Skeleton className="h-12 rounded-none" />

        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="mt-px h-20 rounded-none" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3" aria-label="Loading reservations">
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="h-32" />
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
            <p className="font-medium">
              We couldn&apos;t load your reservations.
            </p>

            <p className="text-sm text-muted-foreground">
              Try again in a moment.
            </p>
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

function formatDate(value: string) {
  const parsedDate = parseDateOnly(value);

  return parsedDate ? dateFormatter.format(parsedDate) : value;
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
