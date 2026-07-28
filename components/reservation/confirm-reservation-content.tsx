"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { CarSummaryCard } from "@/components/reservation/car-summary-card";
import { ReservationItineraryCard } from "@/components/reservation/details/reservation-itinerary-card";
import { reservationPreviewSchema } from "@/lib/validations/reservation.validation";
import { FareSummaryCard } from "./fare-summary-card";

export type ConfirmationCar = {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  images: {
    url: string;
    isPrimary: boolean;
  }[];
};

type ConfirmReservationContentProps = {
  car: ConfirmationCar;
  pickupDate: string;
  returnDate: string;
  rentalDays: number;
  pricePerDay: number;
  totalPrice: number;
};

function readApiErrorMessage(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return null;

  const error = Reflect.get(payload, "error");
  if (typeof error !== "object" || error === null) return null;

  const message = Reflect.get(error, "message");
  return typeof message === "string" ? message : null;
}

function readReservationId(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return null;

  const data = Reflect.get(payload, "data");
  if (typeof data !== "object" || data === null) return null;

  const reservation = Reflect.get(data, "reservation");
  if (typeof reservation !== "object" || reservation === null) return null;

  const id = Reflect.get(reservation, "id");
  return typeof id === "string" ? id : null;
}

function isSuccessfulResponse(payload: unknown) {
  return (
    typeof payload === "object" &&
    payload !== null &&
    Reflect.get(payload, "success") === true
  );
}

export function ConfirmReservationContent({
  car,
  pickupDate,
  returnDate,
  rentalDays,
  pricePerDay,
  totalPrice,
}: ConfirmReservationContentProps) {
  const router = useRouter();
  const submissionInProgress = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const searchParams = new URLSearchParams({
    pickup: pickupDate,
    return: returnDate,
  });
  const carDetailsPath = `/cars/${encodeURIComponent(car.id)}?${searchParams.toString()}`;
  const primaryImage =
    car.images.find((image) => image.isPrimary) ?? car.images[0];

  async function handleReservation() {
    if (submissionInProgress.current) return;

    if (!agreeToTerms) {
      toast.error("Please acknowledge the reservation policy before confirming.");
      return;
    }

    const parsedDates = reservationPreviewSchema.safeParse({
      carId: car.id,
      pickupDate,
      returnDate,
    });

    if (!parsedDates.success) {
      const fieldErrors = parsedDates.error.flatten().fieldErrors;
      toast.error(
        fieldErrors.pickupDate?.[0] ??
          fieldErrors.returnDate?.[0] ??
          "Choose a valid pickup and return date range.",
      );
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carId: car.id, pickupDate, returnDate }),
      });

      let payload: unknown;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !isSuccessfulResponse(payload)) {
        toast.error(
          readApiErrorMessage(payload) ??
            "Unable to submit the reservation. Please try again.",
        );
        return;
      }

      const reservationId = readReservationId(payload);

      if (!reservationId) {
        toast.error("The reservation was created, but its details could not be opened.");
        router.push("/my-reservations");
        router.refresh();
        return;
      }

      toast.success("Reservation submitted successfully.");
      router.push(`/my-reservations/${encodeURIComponent(reservationId)}`);
      router.refresh();
    } catch {
      toast.error("Unable to submit the reservation. Please try again.");
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={carDetailsPath}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to car details
      </Link>

      <h1 className="mb-8 text-2xl font-bold">Confirm your reservation</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CarSummaryCard
            category={car.category}
            name={`${car.brand} ${car.model}`}
            imageSrc={primaryImage?.url}
            seats={car.seats}
            drive={car.transmission}
            engine={car.fuelType}
            year={car.year}
          />

          <ReservationItineraryCard
            pickupDate={pickupDate}
            returnDate={returnDate}
            rentalDays={rentalDays}
            editHref={carDetailsPath}
          />
        </div>

        <div>
          <FareSummaryCard
            dailyPrice={pricePerDay}
            days={rentalDays}
            totalPrice={totalPrice}
            agreeToTerms={agreeToTerms}
            onAgreeChange={setAgreeToTerms}
            onConfirm={handleReservation}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
