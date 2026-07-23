"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  PUBLIC_CAR_CATEGORIES,
  PUBLIC_CAR_FUEL_TYPES,
  PUBLIC_CAR_SEAT_GROUPS,
  PUBLIC_CAR_TRANSMISSIONS,
  type PublicCarsFilters,
  type PublicCarsPriceRange,
} from "@/lib/cars/public-cars";
import { cn } from "@/lib/utils";

import { useCarsUrl } from "./use-cars-url";

const categoryLabels: Record<(typeof PUBLIC_CAR_CATEGORIES)[number], string> = {
  economy: "Economy",
  compact: "Compact",
  sedan: "Sedan",
  suv: "SUV",
  luxury: "Luxury",
  electric: "Electric",
};

const seatLabels: Record<(typeof PUBLIC_CAR_SEAT_GROUPS)[number], string> = {
  "2-4": "2-4 seats",
  "5": "5 seats",
  "7+": "7+ seats",
};

const filterParameterNames = [
  "q",
  "category",
  "transmission",
  "fuel",
  "seats",
  "maxPrice",
] as const;

type MultiSelectFilterName =
  | "category"
  | "transmission"
  | "fuel"
  | "seats";

function FilterGroup({
  title,
  name,
  values,
  selectedValues,
  labels,
  disabled,
  onToggle,
}: {
  title: string;
  name: MultiSelectFilterName;
  values: readonly string[];
  selectedValues: string[];
  labels?: Record<string, string>;
  disabled: boolean;
  onToggle: (
    name: MultiSelectFilterName,
    value: string,
    checked: boolean,
  ) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-[11px] font-bold uppercase tracking-wide text-foreground">
        {title}
      </legend>
      <div className="space-y-2.5">
        {values.map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-2.5 text-xs text-muted-foreground hover:text-foreground has-data-disabled:cursor-not-allowed"
          >
            <Checkbox
              checked={selectedValues.includes(value)}
              disabled={disabled}
              onCheckedChange={(checked) =>
                onToggle(name, value, checked === true)
              }
              className="size-3.5 rounded-sm border-input bg-background"
            />
            <span>{labels?.[value] ?? value[0].toUpperCase() + value.slice(1)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function getSliderValue(value: number | readonly number[]) {
  return typeof value === "number" ? value : value[0];
}

function PriceFilter({
  minimum,
  maximum,
  selectedMaximum,
  step,
  disabled,
  onCommit,
}: {
  minimum: number;
  maximum: number;
  selectedMaximum: number;
  step: number;
  disabled: boolean;
  onCommit: (value: number) => void;
}) {
  const [draftMaximum, setDraftMaximum] = useState(selectedMaximum);
  const isSlidingRef = useRef(false);

  useEffect(() => {
    if (!isSlidingRef.current && !disabled) {
      setDraftMaximum(selectedMaximum);
    }
  }, [disabled, selectedMaximum]);

  function updateDraft(value: number | readonly number[]) {
    isSlidingRef.current = true;
    setDraftMaximum(getSliderValue(value));
  }

  function commitDraft(value: number | readonly number[]) {
    const nextMaximum = getSliderValue(value);
    isSlidingRef.current = false;
    setDraftMaximum(nextMaximum);
    onCommit(nextMaximum);
  }

  return (
    <fieldset>
      <legend className="text-[11px] font-bold uppercase tracking-wide text-foreground">
        Price per day
      </legend>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Selected maximum</span>
        <span className="font-medium text-foreground">
          Up to ${draftMaximum}
        </span>
      </div>
      <Slider
        value={[draftMaximum]}
        min={minimum}
        max={maximum}
        step={step}
        disabled={disabled}
        aria-label="Maximum daily price"
        onValueChange={updateDraft}
        onValueCommitted={commitDraft}
        className="mt-3 py-1"
      />
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>${minimum}</span>
        <span>${maximum}</span>
      </div>
    </fieldset>
  );
}

export function CarsFilterContent({
  filters,
  priceRange,
  showHeading = false,
}: {
  filters: PublicCarsFilters;
  priceRange: PublicCarsPriceRange;
  showHeading?: boolean;
}) {
  const { isPending, replaceQuery } = useCarsUrl();
  const selectedValuesByName: Record<MultiSelectFilterName, string[]> = {
    category: filters.categories,
    transmission: filters.transmissions,
    fuel: filters.fuels,
    seats: filters.seatGroups,
  };

  const selectedMaximum = filters.maxPrice ?? priceRange.max;
  const sliderMinimum = Math.min(priceRange.min, selectedMaximum);
  const sliderMaximum = Math.max(priceRange.max, selectedMaximum);

  function commitMaximumPrice(nextMaximum: number) {
    replaceQuery([
      {
        name: "maxPrice",
        values: nextMaximum >= priceRange.max ? [] : [String(nextMaximum)],
      },
    ]);
  }

  function clearFilters() {
    replaceQuery(
      filterParameterNames.map((name) => ({ name, values: [] })),
    );
  }

  function toggleFilter(
    name: MultiSelectFilterName,
    value: string,
    checked: boolean,
  ) {
    const selectedValues = selectedValuesByName[name];
    const isSelected = selectedValues.includes(value);
    if (checked === isSelected) return;

    const nextValues = checked
      ? [...selectedValues, value]
      : selectedValues.filter((selectedValue) => selectedValue !== value);

    replaceQuery([{ name, values: nextValues }]);
  }

  return (
    <>
      {showHeading && <CarsFiltersHeading isPending={isPending} />}
      <fieldset
        disabled={isPending}
        aria-busy={isPending}
        className={cn(
          "space-y-5 transition-opacity",
          isPending && "opacity-60",
        )}
      >
        <legend className="sr-only">Vehicle filters</legend>
        <FilterGroup
          title="Vehicle category"
          name="category"
          values={PUBLIC_CAR_CATEGORIES}
          selectedValues={filters.categories}
          labels={categoryLabels}
          disabled={isPending}
          onToggle={toggleFilter}
        />
        <Separator />
        <PriceFilter
          minimum={sliderMinimum}
          maximum={sliderMaximum}
          selectedMaximum={selectedMaximum}
          step={priceRange.step}
          disabled={isPending}
          onCommit={commitMaximumPrice}
        />
        <Separator />
        <FilterGroup
          title="Transmission"
          name="transmission"
          values={PUBLIC_CAR_TRANSMISSIONS}
          selectedValues={filters.transmissions}
          disabled={isPending}
          onToggle={toggleFilter}
        />
        <Separator />
        <FilterGroup
          title="Fuel"
          name="fuel"
          values={PUBLIC_CAR_FUEL_TYPES}
          selectedValues={filters.fuels}
          disabled={isPending}
          onToggle={toggleFilter}
        />
        <Separator />
        <FilterGroup
          title="Seating capacity"
          name="seats"
          values={PUBLIC_CAR_SEAT_GROUPS}
          selectedValues={filters.seatGroups}
          labels={seatLabels}
          disabled={isPending}
          onToggle={toggleFilter}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-lg"
          onClick={clearFilters}
        >
          Clear all filters
        </Button>
      </fieldset>
    </>
  );
}

function CarsFiltersHeading({ isPending }: { isPending: boolean }) {
  return (
    <div className="mb-5 flex items-center gap-2 text-sm font-semibold">
      <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
      Filters
      {isPending && (
        <>
          <LoaderCircle
            className="ml-auto size-3.5 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">Updating filters</span>
        </>
      )}
    </div>
  );
}
