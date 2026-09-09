import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AiCarFinderFormValues } from "@/lib/validations/ai-car-finder";

/*
 * These are the fields needed by the recommendation pipeline.
 *
 * presentation-only fields such as primaryImageUrl are never included in the
 * model payload. plate_number, timestamps, customer data, and reservation
 * details are not queried at all.
 */
export type AiCarCandidate = {
  id: string;
  brand: string;
  model: string;
  category: string;
  pricePerDay: number;
  seats: number;
  transmission: string;
  fuelType: string;
  year: number;
  features: string[];
  description: string | null;
  primaryImageUrl: string | null;
};

export async function getAiCarCandidates(
  input: AiCarFinderFormValues,
): Promise<AiCarCandidate[]> {
  const supabase = await createClient();
  const requiredSeats = Number(input.passengers);

  /*
   * Hard eligibility remains deterministic.
   * AI only ranks cars that survive these application/database rules.
   */
  let query = supabase
    .from("cars")
    .select(
      `
        id,
        brand,
        model,
        category,
        price_per_day,
        seats,
        transmission,
        fuel_type,
        year,
        features,
        description,
        car_images (
          image_url,
          is_primary,
          display_order
        )
      `,
    )
    .eq("status", "available")
    .gte("seats", requiredSeats)
    .lte("price_per_day", input.budgetPerDay);

  if (input.transmission !== "any") {
    query = query.eq("transmission", input.transmission);
  }

  if (input.fuel !== "any") {
    query = query.eq("fuel_type", input.fuel);
  }

  const { data: cars, error: carsError } = await query
    .order("price_per_day", { ascending: true })
    .order("id", { ascending: true });

  if (carsError) {
    throw new Error(`Unable to load candidate cars: ${carsError.message}`);
  }

  if (!cars?.length) {
    return [];
  }

  const availabilityChecks = await Promise.all(
    cars.map(async (car) => {
      const { data: isAvailable, error: availabilityError } =
        await supabase.rpc("is_car_available", {
          p_car_id: car.id,
          p_pickup_date: input.pickupDate,
          p_return_date: input.returnDate,
        });

      if (availabilityError) {
        throw new Error(
          `Unable to check availability for car ${car.id}: ${availabilityError.message}`,
        );
      }

      return {
        car,
        isAvailable: isAvailable === true,
      };
    }),
  );

  return availabilityChecks
    .filter(({ isAvailable }) => isAvailable)
    .map(({ car }) => {
      const images = Array.isArray(car.car_images)
        ? [...car.car_images].sort(
            (first, second) =>
              Number(second.is_primary) - Number(first.is_primary) ||
              first.display_order - second.display_order,
          )
        : [];

      const primaryImagePath = images[0]?.image_url ?? null;
      const primaryImageUrl = primaryImagePath
        ? supabase.storage
            .from("car-images")
            .getPublicUrl(primaryImagePath).data.publicUrl
        : null;

      return {
        id: car.id,
        brand: car.brand,
        model: car.model,
        category: car.category,
        pricePerDay: Number(car.price_per_day),
        seats: car.seats,
        transmission: car.transmission,
        fuelType: car.fuel_type,
        year: car.year,
        features: car.features ?? [],
        description: car.description,
        primaryImageUrl,
      };
    });
}
