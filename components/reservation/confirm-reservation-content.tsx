'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';

import { CarSummaryCard } from './car-summary-card';
import { PaymentMethodSelector } from './payment-method-selector';
import { FareSummaryCard } from './fare-summary-card';

interface ConfirmReservationContentProps {
  carId?: string;
}

export function ConfirmReservationContent({
  carId: propCarId,
}: ConfirmReservationContentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'onsite'>('card');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const searchParams = useSearchParams();
  const params = useParams();

  const pathCarId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const carId =
    propCarId ||
    pathCarId ||
    searchParams.get('carId') ||
    searchParams.get('id') ||
    '';

  const startDate =
    searchParams.get('pickup') ||
    searchParams.get('startDate') ||
    '2026-08-14';
  const endDate =
    searchParams.get('return') ||
    searchParams.get('endDate') ||
    '2026-08-18';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleReservation = () => {
    if (!agreeToTerms) {
      alert('Please agree to the rental terms before confirming.');
      return;
    }

    const payload = {
      carId,
      startDate,
      endDate,
      paymentMethod,
    };

    console.log('Submitting reservation payload:', payload);
    alert('Reservation request initiated!');
  };

  const carDetailsPath = carId
    ? `/cars/${encodeURIComponent(carId)}?pickup=${encodeURIComponent(startDate)}&return=${encodeURIComponent(endDate)}`
    : '/cars';

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
          <CarSummaryCard />

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
                  <p className="font-semibold text-foreground">{startDate} at 10:00 AM</p>
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
                  <p className="font-semibold text-foreground">{endDate} at 10:00 AM</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Downtown Mobility Hub, Block A</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full h-60 rounded-lg overflow-hidden border shadow-inner bg-slate-100">
              {isMounted ? (
                <iframe
                  title="Downtown Location Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src="https://maps.google.com/maps?q=Downtown%20Beirut%20Central%20District&t=&z=15&ie=UTF8&iwloc=B&output=embed"
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-slate-200 flex items-center justify-center text-xs text-slate-400">
                  Loading map...
                </div>
              )}
            </div>
          </div>

          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onMethodChange={setPaymentMethod}
          />
        </div>

        <div className="lg:col-span-1">
          <FareSummaryCard
            agreeToTerms={agreeToTerms}
            onAgreeChange={setAgreeToTerms}
            onConfirm={handleReservation}
          />
        </div>
      </div>
    </div>
  );
}