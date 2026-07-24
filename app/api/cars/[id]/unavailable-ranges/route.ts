import { NextResponse } from "next/server";

import {
  CarUnavailableRangesError,
  getCarUnavailableRanges,
} from "@/lib/server/reservations/get-car-unavailable-ranges";
import { carUnavailableRangesSchema } from "@/lib/validations/reservation.validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);

  const parsed = carUnavailableRangesSchema.safeParse({
    carId: id,
    from: searchParams.get("from"),
    to: searchParams.get("to"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Please check the requested calendar range.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  try {
    const ranges = await getCarUnavailableRanges(parsed.data);

    return NextResponse.json(
      {
        success: true,
        data: ranges,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (
      error instanceof CarUnavailableRangesError &&
      error.code === "CAR_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: 404 },
      );
    }

    console.error("Unavailable ranges route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAVAILABLE_RANGES_FAILED",
          message: "Unable to load unavailable dates. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}
