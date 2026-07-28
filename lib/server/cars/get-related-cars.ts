import "server-only";

import { createClient } from "@/lib/supabase/server";

type RelatedCarsInput = {
  id: string;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  pricePerDay: number;
};

const RELATED_CARS_LIMIT = 3;

export async function getRelatedCars(currentCar: RelatedCarsInput) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
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
        car_images (
          id,
          image_url,
          is_primary,
          display_order
        )
      `,
      )
      .eq("status", "available")
      .neq("id", currentCar.id);

    if (error) {
      console.error("Related cars load error:", error);

      return {
        success: false as const,
        error: {
          code: "RELATED_CARS_LOAD_FAILED",
          message: "Unable to load related cars.",
        },
      };
    }

    const relatedCars = (data ?? [])
      .map((car) => {
        const images = Array.isArray(car.car_images)
          ? [...car.car_images].sort(
              (first, second) => first.display_order - second.display_order,
            )
          : [];

        const primaryImage =
          images.find((image) => image.is_primary) ?? images[0] ?? null;

        const pricePerDay = Number(car.price_per_day);

        let similarityScore = 0;

        if (car.category === currentCar.category) {
          similarityScore += 100;
        }

        if (car.transmission === currentCar.transmission) {
          similarityScore += 20;
        }

        if (car.fuel_type === currentCar.fuelType) {
          similarityScore += 15;
        }

        if (car.seats === currentCar.seats) {
          similarityScore += 15;
        }

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
          pricePerDay,
          status: car.status,
          primaryImageUrl: primaryImage
            ? supabase.storage
                .from("car-images")
                .getPublicUrl(primaryImage.image_url).data.publicUrl
            : null,

          // Used only while sorting.
          similarityScore,
          priceDifference: Math.abs(pricePerDay - currentCar.pricePerDay),
        };
      })
      .sort((first, second) => {
        // Higher similarity wins.
        if (first.similarityScore !== second.similarityScore) {
          return second.similarityScore - first.similarityScore;
        }

        // When similarity is equal, prefer the closest price.
        if (first.priceDifference !== second.priceDifference) {
          return first.priceDifference - second.priceDifference;
        }

        // Final stable preference: newer car first.
        if (first.year !== second.year) {
          return second.year - first.year;
        }

        return first.id.localeCompare(second.id);
      })
      .slice(0, RELATED_CARS_LIMIT)
      .map(({ ...car }) => car);

    return {
      success: true as const,
      data: relatedCars,
    };
  } catch (error) {
    console.error("Related cars load error:", error);

    return {
      success: false as const,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    };
  }
}
