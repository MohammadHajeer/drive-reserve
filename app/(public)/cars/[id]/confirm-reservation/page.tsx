import { Suspense } from 'react';
import { ConfirmReservationContent } from '@/components/reservation/confirm-reservation-content';

export default function ConfirmReservationPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted-foreground animate-pulse">
          Loading reservation details...
        </div>
      }
    >
      <ConfirmReservationContent />
    </Suspense>
  );
}