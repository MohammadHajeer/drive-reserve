import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminCarsPage } from "@/components/admin/cars/admin-cars-page";
import { CarsListLoadingSkeleton } from "@/components/admin/cars/cars-states";

export const metadata: Metadata = { title: "Car Management" };

export default function CarsPage() {
  return (
    <Suspense fallback={<CarsListLoadingSkeleton />}>
      <AdminCarsPage />
    </Suspense>
  );
}
