"use client";

import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";

import { CarCard } from "@/components/car/car-card";
import {
  carCategories,
  fuelTypes,
  mockCars,
  seatFilters,
  transmissions,
} from "@/lib/mock-cars";

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}

export default function CarsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(250);
  const [sortOption, setSortOption] = useState("price-asc");

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  const filteredCars = useMemo(() => {
    const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();

    return mockCars
      .filter((car) => {
        const textMatch =
          !normalizedSearch ||
          `${car.brand} ${car.model} ${car.category}`
            .toLowerCase()
            .includes(normalizedSearch);

        const categoryMatch =
          selectedCategories.length === 0 ||
          selectedCategories.includes(car.category);

        const transmissionMatch =
          selectedTransmissions.length === 0 ||
          selectedTransmissions.includes(car.transmission);

        const fuelMatch =
          selectedFuelTypes.length === 0 ||
          selectedFuelTypes.includes(car.fuelType);

        const seatMatch =
          selectedSeats.length === 0 ||
          selectedSeats.some((seatOption) => {
            if (seatOption === "2-4") {
              return car.seats >= 2 && car.seats <= 4;
            }
            if (seatOption === "5") {
              return car.seats === 5;
            }
            return car.seats >= 7;
          });

        const priceMatch = car.pricePerDay <= maxPrice;

        return (
          textMatch &&
          categoryMatch &&
          transmissionMatch &&
          fuelMatch &&
          seatMatch &&
          priceMatch
        );
      })
      .sort((first, second) => {
        if (sortOption === "price-asc") {
          return first.pricePerDay - second.pricePerDay;
        }

        return second.pricePerDay - first.pricePerDay;
      });
  }, [debouncedSearchTerm, selectedCategories, selectedTransmissions, selectedFuelTypes, selectedSeats, maxPrice, sortOption]);

  function toggleSelection(
    value: string,
    setValue: Dispatch<SetStateAction<string[]>>,
  ) {
    setValue((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategories([]);
    setSelectedTransmissions([]);
    setSelectedFuelTypes([]);
    setSelectedSeats([]);
    setMaxPrice(250);
  }

  return (
    <main className="min-h-screen bg-background px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[300px_1fr]">
        <aside className="rounded-[2rem] border border-border bg-card p-6 shadow-sm shadow-slate-950/5">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">
                Filters
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Narrow your search by category, price, or car specs.
              </p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-primary transition hover:text-primary/80"
            >
              Reset
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                <Search className="size-4 text-primary" />
                Search
              </label>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search brand, model, category"
                className="w-full rounded-3xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Vehicle category</p>
              <div className="grid gap-2">
                {carCategories.map((category) => (
                  <label key={category} className="flex items-center gap-3 rounded-3xl border border-border bg-muted px-3 py-3 text-sm text-foreground transition hover:border-primary">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleSelection(category, setSelectedCategories)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Price per day</p>
                <span className="text-sm text-muted-foreground">Up to ${maxPrice}</span>
              </div>
              <input
                type="range"
                min={40}
                max={250}
                step={5}
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>$40</span>
                <span>$250+</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Transmission</p>
              <div className="grid gap-2">
                {transmissions.map((transmission) => (
                  <label key={transmission} className="flex items-center gap-3 rounded-3xl border border-border bg-muted px-3 py-3 text-sm text-foreground transition hover:border-primary">
                    <input
                      type="checkbox"
                      checked={selectedTransmissions.includes(transmission)}
                      onChange={() => toggleSelection(transmission, setSelectedTransmissions)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    {transmission}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Fuel type</p>
              <div className="grid gap-2">
                {fuelTypes.map((fuelType) => (
                  <label key={fuelType} className="flex items-center gap-3 rounded-3xl border border-border bg-muted px-3 py-3 text-sm text-foreground transition hover:border-primary">
                    <input
                      type="checkbox"
                      checked={selectedFuelTypes.includes(fuelType)}
                      onChange={() => toggleSelection(fuelType, setSelectedFuelTypes)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    {fuelType}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Seating capacity</p>
              <div className="grid gap-2">
                {seatFilters.map((seatOption) => (
                  <label key={seatOption} className="flex items-center gap-3 rounded-3xl border border-border bg-muted px-3 py-3 text-sm text-foreground transition hover:border-primary">
                    <input
                      type="checkbox"
                      checked={selectedSeats.includes(seatOption)}
                      onChange={() => toggleSelection(seatOption, setSelectedSeats)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    {seatOption === "2-4" ? "2-4 seats" : seatOption === "5" ? "5 seats" : "7+ seats"}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-8">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card p-6 shadow-sm shadow-slate-950/5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Available Vehicles</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse premium cars available across Lebanon.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-2 rounded-3xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
                <Search className="size-4 text-primary" />
                <span>{filteredCars.length} results</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-3xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
                <ArrowUpDown className="size-4 text-primary" />
                <label className="flex items-center gap-2 text-sm text-foreground">
                  Sort:
                  <select
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value)}
                    className="rounded-3xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          {filteredCars.length === 0 ? (
            <div className="rounded-[2rem] border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No cars match the selected filters. Try expanding the price range or clearing some options.
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
