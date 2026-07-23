"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";
import { toast } from "sonner";
import { CarForm } from "@/components/admin/cars/car-form";
import { CarsErrorState, CarsLoadingSkeleton } from "@/components/admin/cars/cars-states";
import { useAdminCar } from "@/features/admin/cars/hooks/use-admin-car";
import { useUpdateCar } from "@/features/admin/cars/hooks/use-update-car";
import type { CreateAdminCarInput } from "@/features/admin/cars/admin-car.types";

export default function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const carQuery = useAdminCar(id);
  const mutation = useUpdateCar();

  async function submit(values: CreateAdminCarInput) {
    try {
      await mutation.mutateAsync({ carId: id, input: values });
      toast.success("Car updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update the car.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/cars"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="size-4" /> Back to cars
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
          Edit Car
        </h1>
        <p className="mt-2 text-slate-500">
          Update the vehicle attributes and operational status.
        </p>
      </div>

      {carQuery.isLoading ? (
        <CarsLoadingSkeleton />
      ) : carQuery.isError ? (
        <CarsErrorState
          message={
            carQuery.error instanceof Error
              ? carQuery.error.message
              : "Unable to load this car."
          }
          onRetry={() => carQuery.refetch()}
        />
      ) : carQuery.data ? (
        <CarForm
          car={carQuery.data}
          submitting={mutation.isPending}
          onSubmit={submit}
        />
      ) : null}
    </div>
  );
}
