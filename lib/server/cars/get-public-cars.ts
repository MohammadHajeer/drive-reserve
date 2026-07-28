import "server-only";

import { z } from "zod";

import {
  DEFAULT_PUBLIC_CARS_FILTERS,
  PUBLIC_CAR_CATEGORIES,
  PUBLIC_CAR_FUEL_TYPES,
  PUBLIC_CAR_SEAT_GROUPS,
  PUBLIC_CAR_SORT_OPTIONS,
  PUBLIC_CAR_TRANSMISSIONS,
  PUBLIC_CAR_VIEWS,
  type PublicCarsFilters,
  type PublicCarsPriceRange,
  type PublicCarsSearchParams,
} from "@/lib/cars/public-cars";
import { createClient } from "@/lib/supabase/server";

const filtersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(80)
    .regex(/^[\p{L}\p{N}\s-]*$/u),
  categories: z.array(z.enum(PUBLIC_CAR_CATEGORIES)).max(6),
  transmissions: z.array(z.enum(PUBLIC_CAR_TRANSMISSIONS)).max(2),
  fuels: z.array(z.enum(PUBLIC_CAR_FUEL_TYPES)).max(4),
  seatGroups: z.array(z.enum(PUBLIC_CAR_SEAT_GROUPS)).max(3),
  maxPrice: z.number().min(0).max(100_000).optional(),
  sort: z.enum(PUBLIC_CAR_SORT_OPTIONS),
  page: z.number().int().min(1).max(10_000),
  view: z.enum(PUBLIC_CAR_VIEWS),
});

const categoryLabels: Record<(typeof PUBLIC_CAR_CATEGORIES)[number], string> = {
  economy: "Economy",
  compact: "Compact",
  sedan: "Sedan",
  suv: "SUV",
  luxury: "Luxury",
  electric: "Electric",
};

const sortOptions = {
  "price-asc": { column: "price_per_day", ascending: true },
  "price-desc": { column: "price_per_day", ascending: false },
  newest: { column: "created_at", ascending: false },
  "year-desc": { column: "year", ascending: false },
  "brand-asc": { column: "brand", ascending: true },
} as const;

function firstValue(
  searchParams: PublicCarsSearchParams,
  name: string,
): string | undefined {
  const value = searchParams[name];
  return Array.isArray(value) ? value[0] : value;
}

function listValues(
  searchParams: PublicCarsSearchParams,
  name: string,
): string[] {
  const value = searchParams[name];
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return [
    ...new Set(
      values
        .flatMap((item) => item.split(","))
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

function enumValues<const T extends readonly string[]>(
  values: string[],
  supportedValues: T,
): T[number][] {
  const supported = new Set<string>(supportedValues);
  return values.filter((value): value is T[number] => supported.has(value));
}

function enumValue<const T extends readonly string[]>(
  value: string | undefined,
  supportedValues: T,
  fallback: T[number],
): T[number] {
  return value && supportedValues.includes(value as T[number])
    ? (value as T[number])
    : fallback;
}

function positiveNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 100_000
    ? number
    : undefined;
}

function pageNumber(value: string | undefined): number {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 10_000
    ? number
    : 1;
}

export function normalizePublicCarsFilters(
  searchParams: PublicCarsSearchParams,
): PublicCarsFilters {
  const rawQuery = (firstValue(searchParams, "q") ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);
  const q = /^[\p{L}\p{N}\s-]*$/u.test(rawQuery) ? rawQuery : "";

  return filtersSchema.parse({
    q,
    categories: enumValues(
      listValues(searchParams, "category"),
      PUBLIC_CAR_CATEGORIES,
    ),
    transmissions: enumValues(
      listValues(searchParams, "transmission"),
      PUBLIC_CAR_TRANSMISSIONS,
    ),
    fuels: enumValues(listValues(searchParams, "fuel"), PUBLIC_CAR_FUEL_TYPES),
    seatGroups: enumValues(
      listValues(searchParams, "seats"),
      PUBLIC_CAR_SEAT_GROUPS,
    ),
    maxPrice: positiveNumber(firstValue(searchParams, "maxPrice")),
    sort: enumValue(
      firstValue(searchParams, "sort")?.toLowerCase(),
      PUBLIC_CAR_SORT_OPTIONS,
      DEFAULT_PUBLIC_CARS_FILTERS.sort,
    ),
    page: pageNumber(firstValue(searchParams, "page")),
    view: enumValue(
      firstValue(searchParams, "view")?.toLowerCase(),
      PUBLIC_CAR_VIEWS,
      DEFAULT_PUBLIC_CARS_FILTERS.view,
    ),
  });
}

async function queryPublicCarsPriceRange(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<PublicCarsPriceRange> {
  const [lowestPriceResult, highestPriceResult] = await Promise.all([
    supabase
      .from("cars")
      .select("price_per_day")
      .eq("status", "available")
      .order("price_per_day", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("cars")
      .select("price_per_day")
      .eq("status", "available")
      .order("price_per_day", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (lowestPriceResult.error || highestPriceResult.error) {
    console.error(
      "Cars price range error:",
      lowestPriceResult.error ?? highestPriceResult.error,
    );
  }

  const priceStep = 5;
  const rawMinimum = Number(lowestPriceResult.data?.price_per_day ?? 0);
  const rawMaximum = Number(highestPriceResult.data?.price_per_day ?? 0);

  return {
    min: Math.max(0, Math.floor(rawMinimum / priceStep) * priceStep),
    max: Math.max(priceStep, Math.ceil(rawMaximum / priceStep) * priceStep),
    step: priceStep,
  };
}

export async function getPublicCarsPriceRange() {
  try {
    const supabase = await createClient();
    return await queryPublicCarsPriceRange(supabase);
  } catch (error) {
    console.error("Cars price range load error:", error);
    return { min: 0, max: 5, step: 5 } satisfies PublicCarsPriceRange;
  }
}

export async function getPublicCars(
  filters: PublicCarsFilters,
  options: {
    limit?: number;
    priceRange?: PublicCarsPriceRange | Promise<PublicCarsPriceRange>;
  } = {},
) {
  try {
    const validatedFilters = filtersSchema.parse(filters);
    const limit = z
      .number()
      .int()
      .min(1)
      .max(24)
      .parse(options.limit ?? 6);
    const {
      q,
      categories,
      transmissions,
      fuels,
      seatGroups,
      maxPrice,
      sort,
      page,
    } = validatedFilters;

    const supabase = await createClient();
    let query = supabase
      .from("cars")
      .select(
        `
          id,
          brand,
          model,
          year,
          color,
          category,
          transmission,
          fuel_type,
          seats,
          price_per_day,
          status,
          created_at,
          car_images (
            id,
            image_url,
            is_primary,
            display_order
          )
        `,
        { count: "exact" },
      )
      .eq("status", "available");

    if (q) {
      query = query.or(
        [
          `brand.ilike.%${q}%`,
          `model.ilike.%${q}%`,
          `category.ilike.%${q}%`,
        ].join(","),
      );
    }

    if (categories.length > 0) {
      const categoryFilters = categories.flatMap((category) =>
        category === "electric"
          ? ["fuel_type.eq.electric", "category.ilike.%Electric%"]
          : [`category.ilike.%${categoryLabels[category]}%`],
      );
      query = query.or(categoryFilters.join(","));
    }

    if (transmissions.length > 0) {
      query = query.in("transmission", transmissions);
    }

    if (fuels.length > 0) {
      query = query.in("fuel_type", fuels);
    }

    if (maxPrice !== undefined) {
      query = query.lte("price_per_day", maxPrice);
    }

    if (seatGroups.length > 0) {
      const seatFilters = seatGroups.map((group) => {
        if (group === "2-4") return "and(seats.gte.2,seats.lte.4)";
        if (group === "5") return "seats.eq.5";
        return "seats.gte.7";
      });
      query = query.or(seatFilters.join(","));
    }

    const sortOption = sortOptions[sort];
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const [carsResult, priceRange] = await Promise.all([
      query
        .order(sortOption.column, { ascending: sortOption.ascending })
        .order("id", { ascending: true })
        .range(from, to),
      options.priceRange ?? queryPublicCarsPriceRange(supabase),
    ]);

    const { data, count, error } = carsResult;
    if (error) {
      console.error("Cars listing error:", error);
      return {
        success: false as const,
        error: {
          code: "CARS_LOAD_FAILED",
          message: "Unable to load the available cars.",
        },
      };
    }

    const cars = (data ?? []).map((car) => {
      const images = Array.isArray(car.car_images)
        ? [...car.car_images].sort(
            (first, second) => first.display_order - second.display_order,
          )
        : [];
      const primaryImage =
        images.find((image) => image.is_primary) ?? images[0] ?? null;

      return {
        id: car.id,
        brand: car.brand,
        model: car.model,
        year: car.year,
        color: car.color,
        category: car.category,
        transmission: car.transmission,
        fuelType: car.fuel_type,
        seats: car.seats,
        pricePerDay: Number(car.price_per_day),
        status: car.status,
        primaryImageUrl: primaryImage
          ? supabase.storage
              .from("car-images")
              .getPublicUrl(primaryImage.image_url).data.publicUrl
          : null,
      };
    });

    const total = count ?? 0;
    return {
      success: true as const,
      data: {
        cars,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        },
        priceRange,
      },
    };
  } catch (error) {
    console.error("Cars load error:", error);
    return {
      success: false as const,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    };
  }
}
