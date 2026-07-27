import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CarFront } from "lucide-react";

import { CarForm } from "@/components/admin/cars/car-form";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCarForEdit } from "@/features/admin/cars/services/get-admin-car.server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Edit Car",
};

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getAdminCarForEdit(id);

  if (!car) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="space-y-5">
        <Link
          href="/admin/cars"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-3 rounded-xl text-muted-foreground",
          )}
        >
          <ArrowLeft /> Back to cars
        </Link>
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <CarFront className="size-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">
              Fleet management
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              Edit {car.brand} {car.model}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Update vehicle details and manage its customer-facing image
              gallery independently.
            </p>
          </div>
        </div>
      </header>

      <CarForm key={car.id} mode="edit" initialCar={car} />
    </div>
  );
}
