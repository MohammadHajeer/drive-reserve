"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CarForm } from "@/components/admin/cars/car-form";
import { useCreateCar } from "@/features/admin/cars/hooks/use-create-car";
import type { CreateAdminCarInput } from "@/features/admin/cars/admin-car.types";

export default function NewCarPage() {
  const router = useRouter();
  const mutation = useCreateCar();
  async function submit(values: CreateAdminCarInput) {
    try { const car = await mutation.mutateAsync(values); toast.success("Car created successfully."); router.push(`/admin/cars/${car.id}/edit`); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create the car."); }
  }
  return <div className="space-y-6"><div><Link href="/admin/cars" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"><ArrowLeft className="size-4" /> Back to cars</Link><h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Add New Car</h1><p className="mt-2 text-slate-500">Create a new fleet record using the schema fields supported by the API.</p></div><CarForm submitting={mutation.isPending} onSubmit={submit} /></div>;
}
