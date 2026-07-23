"use client";

import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { CarCard } from "@/components/car/car-card";
import {
  carCategories,
  fuelTypes,
  mockCars,
  seatFilters,
  transmissions,
} from "@/lib/mock-cars";

const CARS_PER_PAGE = 6;

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}


function getPaginationRange(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  const range: (number | "ellipsis")[] = [];
  const delta = 1;

  for (let page = 1; page <= totalPages; page++) {
    const isEdge = page === 1 || page === totalPages;
    const isNearCurrent = Math.abs(page - currentPage) <= delta;

    if (isEdge || isNearCurrent) {
      range.push(page);
    } else if (range[range.length - 1] !== "ellipsis") {
      range.push("ellipsis");
    }
  }

  return range;
}



export default function CarsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(250);
  const [sortOption, setSortOption] = useState("price-asc");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset to page 1 whenever the filtered results change, so we never land on an empty page.
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCars]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / CARS_PER_PAGE));

  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * CARS_PER_PAGE;
    return filteredCars.slice(start, start + CARS_PER_PAGE);
  }, [filteredCars, currentPage]);

  function goToPage(page: number) {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
  }

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
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>

            {totalPages > 1 && (
  <div className="flex flex-col items-center justify-between gap-3 pt-2 sm:flex-row">
    <p className="text-sm text-muted-foreground">
  Showing{" "}
  <span className="font-semibold text-foreground">
    {(currentPage - 1) * CARS_PER_PAGE + 1}
  </span>{" "}
  to{" "}
  <span className="font-semibold text-foreground">
    {Math.min(currentPage * CARS_PER_PAGE, filteredCars.length)}
  </span>{" "}
  of{" "}
  <span className="font-semibold text-foreground">
    {filteredCars.length}
  </span>{" "}
  vehicles
</p>

    <nav
      aria-label="Car listings pagination"
      className="flex items-center gap-2"
    >
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="size-4" />
      </button>

      <div className="flex items-center gap-1">
        {getPaginationRange(currentPage, totalPages).map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex size-9 items-center justify-center text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`inline-flex size-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  </div>
)}
</>
          )}
        </section>
      </div>
    </main>
  );
}