"use client";

import { type FormEvent, type ReactNode, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CarFront,
  Fuel,
  Gauge,
  LoaderCircle,
  Search,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HeroFilterFormProps = {
  categories: readonly string[];
  transmissions: readonly string[];
  fuelTypes: readonly string[];
  seatGroups: readonly string[];
};

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  allLabel: string;
  options: readonly string[];
  icon: LucideIcon;
  onValueChange: (value: string) => void;
  formatOption?: (value: string) => ReactNode;
};

const ALL_VALUE = "all";

function formatOption(value: string) {
  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatSeats(value: string) {
  if (value === "2-4") return "2–4 seats";
  if (value === "5") return "5 seats";
  if (value === "7+") return "7+ seats";

  return value;
}

export function HeroFilterForm({
  categories,
  transmissions,
  fuelTypes,
  seatGroups,
}: HeroFilterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [category, setCategory] = useState(ALL_VALUE);
  const [transmission, setTransmission] = useState(ALL_VALUE);
  const [fuel, setFuel] = useState(ALL_VALUE);
  const [seats, setSeats] = useState(ALL_VALUE);

  const selectedCount = [category, transmission, fuel, seats].filter(
    (value) => value !== ALL_VALUE,
  ).length;

  function resetFilters() {
    setCategory(ALL_VALUE);
    setTransmission(ALL_VALUE);
    setFuel(ALL_VALUE);
    setSeats(ALL_VALUE);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (category !== ALL_VALUE) {
      params.set("category", category);
    }

    if (transmission !== ALL_VALUE) {
      params.set("transmission", transmission);
    }

    if (fuel !== ALL_VALUE) {
      params.set("fuel", fuel);
    }

    if (seats !== ALL_VALUE) {
      params.set("seats", seats);
    }

    const query = params.toString();
    const destination = query ? `/cars?${query}` : "/cars";

    startTransition(() => {
      router.push(destination);
    });
  }

  return (
    <div
      id="find-your-car"
      className="overflow-hidden rounded-3xl border border-white/15 bg-white/95 shadow-2xl shadow-black/40 backdrop-blur-2xl"
    >
      <div className="relative overflow-hidden border-b border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-7 text-white sm:px-7">
        <div className="absolute -right-14 -top-16 size-48 rounded-full bg-blue-500/25 blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-blue-300">
              Find your ideal match
            </p>

            {selectedCount > 0 && (
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-blue-100">
                {selectedCount} selected
              </span>
            )}
          </div>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            What kind of car do you need?
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
            Choose your preferred specifications and we will take you directly
            to matching vehicles.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-5 sm:p-7"
        aria-busy={isPending}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FilterSelect
            id="hero-category"
            label="Car category"
            allLabel="Any category"
            value={category}
            options={categories}
            icon={CarFront}
            onValueChange={setCategory}
          />

          <FilterSelect
            id="hero-seats"
            label="Seating capacity"
            allLabel="Any seat count"
            value={seats}
            options={seatGroups}
            icon={UsersRound}
            onValueChange={setSeats}
            formatOption={formatSeats}
          />

          <FilterSelect
            id="hero-fuel"
            label="Fuel type"
            allLabel="Any fuel type"
            value={fuel}
            options={fuelTypes}
            icon={Fuel}
            onValueChange={setFuel}
          />

          <FilterSelect
            id="hero-transmission"
            label="Transmission"
            allLabel="Any transmission"
            value={transmission}
            options={transmissions}
            icon={Gauge}
            onValueChange={setTransmission}
          />
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Search className="size-4" aria-hidden="true" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-900">
                {selectedCount > 0
                  ? `${selectedCount} preference${
                      selectedCount === 1 ? "" : "s"
                    } selected`
                  : "Browse the full collection"}
              </p>

              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                Availability and pricing can be checked after choosing a
                vehicle.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl sm:w-auto"
            disabled={isPending || selectedCount === 0}
            onClick={resetFilters}
          >
            Clear
          </Button>

          <Button
            type="submit"
            className="h-11 sm:flex-1 rounded-xl bg-linear-to-r from-blue-500 to-blue-600 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            disabled={isPending}
          >
            {isPending ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Search className="size-4" aria-hidden="true" />
            )}

            {isPending ? "Finding cars..." : "View matching cars"}

            {!isPending && <ArrowRight className="size-4" aria-hidden="true" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  allLabel,
  options,
  icon: Icon,
  onValueChange,
  formatOption: formatValue = formatOption,
}: FilterSelectProps) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-slate-700"
      >
        {label}
      </label>

      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== null) {
            onValueChange(nextValue);
          }
        }}
      >
        <SelectTrigger
          id={id}
          className="h-12 w-full rounded-xl border-slate-200 bg-white px-3 shadow-sm transition-shadow focus-visible:ring-primary/20"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>

            <SelectValue />
          </span>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={ALL_VALUE}>{allLabel}</SelectItem>

          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {formatValue(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
