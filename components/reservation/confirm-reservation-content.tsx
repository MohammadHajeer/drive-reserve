"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";

import { reservationPreviewSchema } from "@/lib/validations/reservation.validation";

import { CarSummaryCard } from "./car-summary-card";
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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "onsite">(
    "card",
  );
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const searchParams = new URLSearchParams({
    pickup: pickupDate,
    return: returnDate,
  });
  const carDetailsPath = `/cars/${encodeURIComponent(
    car.id,
  )}?${searchParams.toString()}`;

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

    const parsedDates = reservationPreviewSchema.safeParse({
      carId: car.id,
      pickupDate,
      returnDate,
    });

    if (!parsedDates.success) {
      const fieldErrors = parsedDates.error.flatten().fieldErrors;
      const message =
        fieldErrors.pickupDate?.[0] ??
        fieldErrors.returnDate?.[0] ??
        "Choose a valid pickup and return date range.";

      toast.error(message);
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
            "Unable to submit the reservation. Please try again.",
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

          <div className="bg-card text-card-foreground rounded-xl border p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Itinerary & Location
              </h3>
              <Link
                href={carDetailsPath}
                className="text-xs font-medium text-primary hover:underline"
              >
                Edit
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-lg border">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <span className="text-xs text-muted-foreground font-semibold uppercase">
                    Pick-Up
                  </span>
                  <p className="font-semibold text-foreground">
                    {pickupDate} at 10:00 AM
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Downtown Mobility Hub, Block A</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <span className="text-xs text-muted-foreground font-semibold uppercase">
                    Return
                  </span>
                  <p className="font-semibold text-foreground">
                    {returnDate} at 10:00 AM
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Downtown Mobility Hub, Block A</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full h-60 rounded-lg overflow-hidden border shadow-inner bg-slate-100">
              <iframe
                title="Downtown Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src="https://maps.google.com/maps?q=Downtown%20Beirut%20Central%20District&t=&z=15&ie=UTF8&iwloc=B&output=embed"
              />
            </div>
          </div>

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
