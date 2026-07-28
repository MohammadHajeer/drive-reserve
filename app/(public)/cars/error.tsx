"use client";

import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CarsError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-[70vh] bg-background px-4 py-16 sm:px-6">
      <div
        role="alert"
        className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm"
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-xl font-bold">Unable to load this vehicle page</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Something went wrong while loading the latest vehicle information.
          Retry the request or return to the vehicle listing.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            <RotateCw aria-hidden="true" />
            Try again
          </Button>
          <Link
            href="/cars"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Browse vehicles
          </Link>
        </div>
      </div>
    </main>
  );
}
