"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import { CarCard } from "@/components/cars/car-card";
import type { PublicCarListItem } from "@/lib/cars/public-cars";

type SmartAlternativesProps = {
  currentCar: {
    id: string;
    brand: string;
    model: string;
    year: number;
    category: string;
    transmission: string;
    fuelType: string;
    seats: number;
    pricePerDay: number;
  };
  relatedCars: PublicCarListItem[];
};

type Badge = { id: string; badge: string };

export function SmartAlternatives({ currentCar, relatedCars }: SmartAlternativesProps) {
  const [badges, setBadges] = useState<Map<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (relatedCars.length === 0) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchBadges() {
      try {
        const res = await fetch("/api/ai/smart-alternatives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            currentCar,
            alternatives: relatedCars.map((c) => ({
              id: c.id,
              brand: c.brand,
              model: c.model,
              year: c.year,
              category: c.category,
              transmission: c.transmission,
              fuelType: c.fuelType,
              seats: c.seats,
              pricePerDay: c.pricePerDay,
            })),
          }),
        });
        const text = await res.text();
        let json: { success: boolean; data?: { badges: Badge[] }; error?: { message: string } };
        try {
          json = JSON.parse(text);
        } catch {
          throw new Error("AI alternatives failed");
        }
        if (!res.ok || !json.success || !json.data) throw new Error(json.error?.message || "AI alternatives failed");
        if (!cancelled) {
          setBadges(new Map(json.data.badges.map((b) => [b.id, b.badge])));
        }
      } catch (e) {
        console.warn("Smart Alternatives fetch failed, using fallback", e);
        if (!cancelled) {
          // Fallback badges — clear phrasing, no "vs"
          const fallback = new Map<string, string>();
          for (const alt of relatedCars) {
            const diff = alt.pricePerDay - currentCar.pricePerDay;
            const priceStr = diff === 0 ? "same price as your current" : diff > 0 ? `$${diff} more/day than your current` : `$${Math.abs(diff)} less/day than your current`;
            const transPart = alt.transmission !== currentCar.transmission ? `Switch to ${alt.transmission.toLowerCase()} (your current: ${currentCar.transmission.toLowerCase()})` : alt.transmission;
            const fuelPart = alt.fuelType !== currentCar.fuelType ? ` ${alt.fuelType.toLowerCase()} fuel` : "";
            fallback.set(alt.id, `${transPart}${fuelPart} — ${alt.seats} seats, ${priceStr}`);
          }
          setBadges(fallback);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchBadges();
    return () => {
      cancelled = true;
    };
  }, [currentCar, relatedCars]);

  if (relatedCars.length === 0) return null;

  return (
    <section className="mx-auto mt-12 max-w-7xl">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
        <Sparkles className="size-4 text-primary" aria-hidden="true" />
        Smart Alternatives
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {relatedCars.map((car) => {
          const badge = badges?.get(car.id);
          return (
            <div key={car.id} className="flex flex-col">
              <CarCard car={car} />
              <div className="mt-2 min-h-[48px]">
                {isLoading ? (
                  <div className="animate-pulse rounded-lg border border-muted bg-muted/40 px-2.5 py-2">
                    <div className="h-3 w-20 rounded bg-muted" />
                    <div className="mt-2 h-3 w-full rounded bg-muted" />
                  </div>
                ) : badge ? (
                  <div className="rounded-lg border border-primary/20 bg-primary/[0.06] px-2.5 py-2 text-left">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                      <Sparkles className="size-3" aria-hidden="true" />
                      Why consider
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/80">{badge}</p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
