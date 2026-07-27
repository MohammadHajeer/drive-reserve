"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { CarSummaryCard } from "@/components/reservation/car-summary-card";
import { ReservationItineraryCard } from "@/components/reservation/details/reservation-itinerary-card";
import { FareSummaryCard } from "./fare-summary-card";
import { PaymentMethodSelector } from "./payment-method-selector";

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
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const error = Reflect.get(payload, "error");

  if (typeof error !== "object" || error === null) {
    return null;
  }

  const message = Reflect.get(error, "message");

  return typeof message === "string" ? message : null;
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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "onsite">("card");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const searchParams = new URLSearchParams({
    pickup: pickupDate,
    return: returnDate,
  });
  const carDetailsPath = `/cars/${encodeURIComponent(car.id)}?${searchParams.toString()}`;

  const primaryImage =
    car.images.find((image) => image.isPrimary) ?? car.images[0];

  async function handleReservation() {
    if (submissionInProgress.current) {
      return;
    }

    if (!agreeToTerms) {
      toast.error("Please agree to the rental terms before confirming.");
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carId: car.id,
          pickupDate,
          returnDate,
        }),
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
            "Unable to submit the reservation. Please try again."
        );
        return;
      }

      toast.success("Reservation submitted successfully.");
      router.push("/cars");
      router.refresh();
    } catch {
      toast.error("Unable to submit the reservation. Please try again.");
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  const reservationMock = {
    pickupDate,
    returnDate,
  } as any;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={carDetailsPath}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Car Details
      </Link>

      <h1 className="text-2xl font-bold mb-8">Confirm Your Reservation</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <CarSummaryCard
            category={car.category}
            name={`${car.brand} ${car.model}`}
            imageSrc={primaryImage?.url}
            seats={car.seats}
            drive={car.transmission}
            engine={car.fuelType}
            year={car.year}
          />

          <ReservationItineraryCard reservation={reservationMock} />

          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
          />
        </div>

        <div className="lg:col-span-1">
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