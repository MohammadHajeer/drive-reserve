import Link from "next/link";
import { CarFront } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

export default function CarNotFound() {
  return (
    <main className="min-h-[70vh] bg-background px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CarFront className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Vehicle not found</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This vehicle may no longer be available or the link may be incorrect.
        </p>
        <Link href="/cars" className={buttonVariants({ className: "mt-6" })}>
          Browse available vehicles
        </Link>
      </div>
    </main>
  );
}
