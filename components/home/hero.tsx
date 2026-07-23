import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  PUBLIC_CAR_CATEGORIES,
  PUBLIC_CAR_FUEL_TYPES,
  PUBLIC_CAR_SEAT_GROUPS,
  PUBLIC_CAR_TRANSMISSIONS,
} from "@/lib/cars/public-cars";
import { cn } from "@/lib/utils";

import { HeroFilterForm } from "./hero-filter-form";

const benefits = [
  "Transparent daily pricing",
  "Verified and maintained vehicles",
  "Secure reservation process",
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b bg-slate-950 container-paddings">
      {/* Background */}
      <div
        className="absolute inset-0 -z-30 scale-105 bg-cover bg-position-[center_58%]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=90')",
        }}
      />

      {/* Cinematic overlays */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(2,6,23,.99)_0%,rgba(2,6,23,.94)_42%,rgba(2,6,23,.7)_68%,rgba(2,6,23,.38)_100%)]" />
      <div className="absolute inset-0 -z-20 bg-linear-to-t from-slate-950 via-slate-950/20 to-slate-950/40" />

      {/* Grid texture */}
      <div
        className="absolute inset-0 -z-20 opacity-[0.045]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,.9) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Lighting */}
      <div className="absolute -left-48 top-16 -z-10 size-130 rounded-full bg-primary/20 blur-[160px]" />
      <div className="absolute -right-40 bottom-0 -z-10 size-120 rounded-full bg-blue-500/15 blur-[150px]" />
      <div className="absolute right-[12%] top-[18%] -z-10 size-64 rounded-full bg-sky-400/10 blur-[110px]" />

      <div className="mx-auto grid min-h-195 max-w-7xl items-center gap-14 py-20 pt-24 lg:grid-cols-[1.08fr_.92fr] lg:py-24 lg:pt-32">
        {/* Left content */}
        <div className="max-w-2xl text-white">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 py-2 pl-3 pr-4 text-sm font-medium text-slate-100 shadow-lg shadow-black/10 backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-blue-400" />
            </span>
            <Sparkles className="size-4 text-blue-300" aria-hidden="true" />
            Simple, secure, and flexible car rental
          </div>

          <h1 className="mt-8 text-4xl font-bold leading-[1.03] tracking-tighter sm:text-5xl lg:text-6xl xl:text-7xl">
            The right car for
            <span className="mt-1 block bg-linear-to-r from-blue-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              every journey.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Compare reliable vehicles, narrow down your perfect match, and
            reserve through one clear and convenient rental experience.
          </p>

          <div className="mt-9">
            <Link
              href="/cars"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 px-7 font-semibold text-white shadow-2xl shadow-primary/30 ring-1 ring-inset ring-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/40",
              )}
            >
              Browse all vehicles
              <ArrowRight
                data-icon="inline-end"
                className="size-4"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-slate-300 backdrop-blur-sm"
              >
                <CheckCircle2
                  className="size-4 shrink-0 text-blue-400"
                  aria-hidden="true"
                />
                {benefit}
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-slate-400">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
              <Zap className="size-4" aria-hidden="true" />
            </div>

            <div>
              <p className="font-medium text-slate-200">
                Search based on your preferences
              </p>
              <p className="mt-0.5 text-xs">
                You can refine every filter again from the vehicles page.
              </p>
            </div>
          </div>
        </div>

        {/* Right filter card */}
        <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:ml-auto">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/20 blur-3xl" />

          <div className="absolute -right-5 -top-5 z-100 hidden items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/75 px-4 py-3 text-xs text-white shadow-xl backdrop-blur-xl sm:flex">
            <ShieldCheck className="size-4 text-blue-300" aria-hidden="true" />
            Secure reservation flow
          </div>

          <HeroFilterForm
            categories={PUBLIC_CAR_CATEGORIES}
            transmissions={PUBLIC_CAR_TRANSMISSIONS}
            fuelTypes={PUBLIC_CAR_FUEL_TYPES}
            seatGroups={PUBLIC_CAR_SEAT_GROUPS}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-slate-950/70 to-transparent" />
    </section>
  );
}
