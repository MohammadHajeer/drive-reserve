import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { PublicCarListItem } from "@/lib/cars/public-cars";

export async function fetchAvailableCarsForAI(limit = 50): Promise<PublicCarListItem[]> {
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
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("AI fetch available cars error:", error);
    return [];
  }

  return (data ?? []).map((car) => {
    const images = Array.isArray(car.car_images)
      ? [...car.car_images].sort((a, b) => a.display_order - b.display_order)
      : [];
    const primaryImage = images.find((img) => img.is_primary) ?? images[0] ?? null;
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
      primaryImageUrl: primaryImage ? supabase.storage.from("car-images").getPublicUrl(primaryImage.image_url).data.publicUrl : null,
    } satisfies PublicCarListItem;
  });
}
