import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AiCarFinderFormValues } from "@/lib/validations/ai-car-finder";

/*
 * This is intentionally smaller than the complete cars row.
 * These are the only fields the recommendation feature needs.
 *
 * plate_number, timestamps, image storage paths, and other unrelated data are
 * deliberately excluded.
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
};

export async function getAiCarCandidates(
  input: AiCarFinderFormValues,
): Promise<AiCarCandidate[]> {
  const supabase = await createClient();
  const requiredSeats = Number(input.passengers);

  /*
   * First apply deterministic database filters.
   *
   * AI must never decide factual eligibility such as:
   * - whether a car is active/available for booking
   * - whether it has enough seats
   * - whether it exceeds the user's hard budget
   * - whether it matches an explicitly selected transmission/fuel type
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
        description
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

  /*
   * Date availability remains a database responsibility.
   * Reuse DriveReserve's existing is_car_available RPC instead of asking AI
   * to infer availability or duplicating reservation-overlap rules here.
   */
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
    .map(({ car }) => ({
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
    }));
}
