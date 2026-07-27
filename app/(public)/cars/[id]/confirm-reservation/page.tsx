import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

import { ReservationCard } from "@/components/car-details/reservation-card";
import { ConfirmationPageSkeleton } from "@/components/reservation/confirmation-loading-skeleton";
import { ConfirmReservationContent } from "@/components/reservation/confirm-reservation-content";
import { getPublicCarById } from "@/lib/server/cars/get-public-car-by-id";
import {
  previewReservation,
  ReservationPreviewValidationError,
} from "@/lib/server/reservations/preview-reservation";
import { reservationPreviewSchema } from "@/lib/validations/reservation.validation";
import type { Car } from "@/types/domain";

type SearchParams = {
  pickup?: string | string[];
  return?: string | string[];
};

type AvailableCar = {
  id: string;
  brand: string;
  model: string;
  pricePerDay: number;
  status: Car["status"];
};

import { CalendarDays, CarFront, ShieldCheck } from "lucide-react";

function ReservationDateIssue({
  car,
  message,
}: {
  car: AvailableCar;
  message: string;
}) {
  return (
    <main className="container-paddings mx-auto w-full max-w-3xl py-8 sm:py-10 lg:py-12">
      <Link
        href={`/cars/${encodeURIComponent(car.id)}`}
        className="inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to car details
      </Link>

      <header className="mt-7">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <CalendarDays className="size-4" aria-hidden="true" />
          Reservation dates
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Choose your rental dates
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Select an available pickup and return date for the{" "}
          <span className="font-semibold text-foreground">
            {car.brand} {car.model}
          </span>{" "}
          before continuing to confirmation.
        </p>
      </header>

      <section className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-primary/5 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CarFront className="size-5" aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Dates needed to continue
              </h2>

              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <ReservationCard
            carId={car.id}
            pricePerDay={car.pricePerDay}
            status={car.status}
          />
        </div>
      </section>

      <div className="mt-4 flex items-start justify-center gap-2 px-4 text-center text-xs leading-5 text-muted-foreground">
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />

        <p>
          Your reservation will not be submitted until you review and confirm it
          in the next step.
        </p>
      </div>
    </main>
  );
}

export default async function ConfirmReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const contentKey = `${id}:${String(query.pickup ?? "")}:${String(query.return ?? "")}`;

  return (
    <Suspense key={contentKey} fallback={<ConfirmationPageSkeleton />}>
      <ConfirmationPageContent id={id} query={query} />
    </Suspense>
  );
}

async function ConfirmationPageContent({
  id,
  query,
}: {
  id: string;
  query: SearchParams;
}) {
  const parsedDates = reservationPreviewSchema.safeParse({
    carId: id,
    pickupDate: query.pickup,
    returnDate: query.return,
  });
  const carPromise = getPublicCarById(id);

  const [carOutcome, previewOutcome] = await Promise.allSettled([
    carPromise,
    parsedDates.success
      ? previewReservation(parsedDates.data)
      : Promise.resolve(null),
  ]);

  if (carOutcome.status === "rejected") {
    throw carOutcome.reason;
  }

  const carResult = carOutcome.value;

  if (!carResult.success) {
    if (
      carResult.error.code === "INVALID_CAR_ID" ||
      carResult.error.code === "CAR_NOT_FOUND"
    ) {
      notFound();
    }

    throw new Error(carResult.error.message);
  }

  const { car } = carResult.data;

  if (!parsedDates.success) {
    return (
      <ReservationDateIssue
        car={car}
        message="Choose a valid pickup and return date range to continue with your reservation."
      />
    );
  }

  if (previewOutcome.status === "rejected") {
    const error = previewOutcome.reason;

    if (error instanceof ReservationPreviewValidationError) {
      return <ReservationDateIssue car={car} message={error.message} />;
    }

    throw error;
  }

  const preview = previewOutcome.value;

  if (!preview) {
    throw new Error("The reservation preview returned no data.");
  }

  if (preview.unavailableReason === "CAR_NOT_FOUND") {
    notFound();
  }

  if (!preview.available) {
    const message =
      preview.unavailableReason === "DATES_UNAVAILABLE"
        ? "Those dates are no longer available. Choose a different pickup and return range before confirming."
        : "This car is currently unavailable for reservations. Choose another date range or return to the car listing.";

    return <ReservationDateIssue car={car} message={message} />;
  }

  if (preview.pricePerDay === null || preview.totalPrice === null) {
    throw new Error("The reservation preview returned incomplete pricing.");
  }

  return (
    <ConfirmReservationContent
      car={car}
      pickupDate={preview.pickupDate}
      returnDate={preview.returnDate}
      rentalDays={preview.rentalDays}
      pricePerDay={preview.pricePerDay}
      totalPrice={preview.totalPrice}
    />
  );
}
