"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCarSchema } from "@/lib/validations/cars.validation";
import type { AdminCar, CreateAdminCarInput } from "@/features/admin/cars/admin-car.types";
import { Button } from "@/components/ui/button";

export function CarForm({ car, submitting, onSubmit }: { car?: AdminCar; submitting: boolean; onSubmit: (values: CreateAdminCarInput) => Promise<void> }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAdminCarInput>({
    resolver: zodResolver(createCarSchema),
    defaultValues: { brand: "", model: "", year: new Date().getFullYear(), plateNumber: "", color: "", category: "", transmission: "automatic", fuelType: "petrol", seats: 5, pricePerDay: 0, description: "", status: "available" },
  });

  useEffect(() => {
    if (car) reset({ brand: car.brand, model: car.model, year: car.year, plateNumber: car.plateNumber, color: car.color, category: car.category, transmission: car.transmission as CreateAdminCarInput["transmission"], fuelType: car.fuelType as CreateAdminCarInput["fuelType"], seats: car.seats, pricePerDay: Number(car.pricePerDay), description: car.description ?? "", status: car.status });
  }, [car, reset]);

  const fieldClass = "mt-1 h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-950">Vehicle information</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm font-medium">Brand<input {...register("brand")} className={fieldClass} />{errors.brand && <p className={errorClass}>{errors.brand.message}</p>}</label>
          <label className="text-sm font-medium">Model<input {...register("model")} className={fieldClass} />{errors.model && <p className={errorClass}>{errors.model.message}</p>}</label>
          <label className="text-sm font-medium">Year<input type="number" {...register("year", { valueAsNumber: true })} className={fieldClass} />{errors.year && <p className={errorClass}>{errors.year.message}</p>}</label>
          <label className="text-sm font-medium">Plate number<input {...register("plateNumber")} className={fieldClass} />{errors.plateNumber && <p className={errorClass}>{errors.plateNumber.message}</p>}</label>
          <label className="text-sm font-medium">Color<input {...register("color")} className={fieldClass} />{errors.color && <p className={errorClass}>{errors.color.message}</p>}</label>
          <label className="text-sm font-medium">Category<input {...register("category")} placeholder="SUV, Sedan, Compact..." className={fieldClass} />{errors.category && <p className={errorClass}>{errors.category.message}</p>}</label>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-950">Specifications and pricing</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm font-medium">Transmission<select {...register("transmission")} className={fieldClass}><option value="automatic">Automatic</option><option value="manual">Manual</option></select></label>
          <label className="text-sm font-medium">Fuel type<select {...register("fuelType")} className={fieldClass}><option value="petrol">Petrol</option><option value="diesel">Diesel</option><option value="hybrid">Hybrid</option><option value="electric">Electric</option></select></label>
          <label className="text-sm font-medium">Seats<input type="number" {...register("seats", { valueAsNumber: true })} className={fieldClass} />{errors.seats && <p className={errorClass}>{errors.seats.message}</p>}</label>
          <label className="text-sm font-medium">Price per day ($)<input type="number" step="0.01" {...register("pricePerDay", { valueAsNumber: true })} className={fieldClass} />{errors.pricePerDay && <p className={errorClass}>{errors.pricePerDay.message}</p>}</label>
          <label className="text-sm font-medium">Status<select {...register("status")} className={fieldClass}><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="inactive">Inactive</option></select></label>
        </div>
        <label className="mt-5 block text-sm font-medium">Description<textarea {...register("description")} rows={5} className="mt-1 w-full rounded-xl border bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />{errors.description && <p className={errorClass}>{errors.description.message}</p>}</label>
      </section>

      <div className="flex justify-end"><Button type="submit" size="lg" disabled={submitting}>{submitting ? "Saving..." : car ? "Save Changes" : "Create Car"}</Button></div>
    </form>
  );
}
