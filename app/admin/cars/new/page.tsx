import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CarFront } from "lucide-react";

import { CarForm } from "@/components/admin/cars/car-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Add New Car",
};

export default function NewCarPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="space-y-5">
        <Link
          href="/admin/cars"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-3 rounded-xl text-slate-600",
          )}
        >
          <ArrowLeft /> Back to cars
        </Link>
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <CarFront className="size-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Fleet management
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Add New Car
            </h1>
            <p className="mt-2 max-w-2xl text-slate-500">
              Create the fleet record, configure its availability, and add
              customer-facing images in one flow.
            </p>
          </div>
        </div>
      </header>

      <CarForm mode="create" />
    </div>
  );
}
