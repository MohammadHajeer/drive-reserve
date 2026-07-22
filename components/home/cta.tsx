import Link from "next/link";
import { ArrowRight, CarFront } from "lucide-react";

export function Cta() {
  return (
    <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-center text-white shadow-2xl shadow-primary/20 sm:px-10 sm:py-16">
        <div className="absolute -left-20 -top-20 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -right-16 size-72 rounded-full bg-blue-950/20 blur-2xl" />
        <div className="relative mx-auto max-w-3xl">
          <CarFront className="mx-auto size-11" />
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Ready to start your next journey?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
            Browse available vehicles today or create your account to manage reservations in one place.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/cars" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-primary hover:bg-blue-50">
              Browse Cars <ArrowRight className="size-4" />
            </Link>
            <Link href="/register" className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur hover:bg-white/20">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
