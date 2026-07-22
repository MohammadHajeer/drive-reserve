"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, MapPin, Search, Sparkles } from "lucide-react";

export function Hero() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (pickupDate) params.set("pickupDate", pickupDate);
    if (returnDate) params.set("returnDate", returnDate);

    router.push(params.size ? `/cars?${params.toString()}` : "/cars");
  }

  return (
    <section className="relative isolate overflow-hidden border-b">
      <div className="absolute inset-0 -z-20 bg-slate-950" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(2,6,23,.96)_0%,rgba(2,6,23,.82)_48%,rgba(2,6,23,.32)_100%),url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85')] bg-cover bg-center" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />

      <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
        <div className="max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
            <Sparkles className="size-4 text-blue-300" />
            Simple, secure, and flexible car rental
          </div>

          <h1 className="mt-7 text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Find the right car for your next journey.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Choose your dates, compare reliable vehicles, and reserve your car through one clear and convenient platform.
          </p>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
            {["Transparent pricing", "Verified vehicles", "Secure booking"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-blue-400" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/95 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
          <div className="mb-6">
            <p className="text-sm font-semibold text-primary">Quick search</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Find your perfect car
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your rental details to browse suitable vehicles.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Pickup location
              <span className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
                <MapPin className="size-4 text-primary" />
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  type="text"
                  placeholder="Enter a city or location"
                  className="w-full bg-transparent text-sm font-normal outline-none placeholder:text-slate-400"
                />
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Pickup date
                <span className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
                  <CalendarDays className="size-4 text-primary" />
                  <input
                    value={pickupDate}
                    onChange={(event) => setPickupDate(event.target.value)}
                    type="date"
                    className="w-full bg-transparent text-sm font-normal outline-none"
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-800">
                Return date
                <span className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
                  <CalendarDays className="size-4 text-primary" />
                  <input
                    value={returnDate}
                    onChange={(event) => setReturnDate(event.target.value)}
                    min={pickupDate || undefined}
                    type="date"
                    className="w-full bg-transparent text-sm font-normal outline-none"
                  />
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              <Search className="size-4" />
              Browse Cars
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
