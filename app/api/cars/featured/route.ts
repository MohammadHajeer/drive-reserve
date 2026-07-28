import { NextResponse } from "next/server";

import { DEFAULT_PUBLIC_CARS_FILTERS } from "@/lib/cars/public-cars";
import { getPublicCars } from "@/lib/server/cars/get-public-cars";

export async function GET() {
  const result = await getPublicCars(
    { ...DEFAULT_PUBLIC_CARS_FILTERS, sort: "newest" },
    { limit: 3 },
  );

  if (!result.success) {
    return NextResponse.json(result, {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.json(
    {
      success: true,
      data: { cars: result.data.cars },
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
