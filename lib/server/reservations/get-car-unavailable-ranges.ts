import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { CarUnavailableRangesInput } from "@/lib/validations/reservation.validation";

export type CarUnavailableRange = {
  startDate: string;
  endDateExclusive: string;
};

export class CarUnavailableRangesError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "CarUnavailableRangesError";
  }
}

export async function getCarUnavailableRanges(
  input: CarUnavailableRangesInput,
): Promise<CarUnavailableRange[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_car_unava ilable_ranges", {
    p_car_id: input.carId,
    p_from_date: input.from,
    p_to_date: input.to,
  });

  if (error) {
    console.error("Unavailable ranges RPC error:", error);

    if (error.message.includes("CAR_NOT_FOUND")) {
      throw new CarUnavailableRangesError(
        "The requested car could not be found.",
        "CAR_NOT_FOUND",
      );
    }

    if (error.message.includes("DATE_RANGE_TOO_LARGE")) {
      throw new CarUnavailableRangesError(
        "The requested calendar range is too large.",
        "DATE_RANGE_TOO_LARGE",
      );
    }

    throw new CarUnavailableRangesError(
      "Unable to load the car's unavailable dates.",
      "UNAVAILABLE_RANGES_FAILED",
    );
  }

  return (data ?? []).map((range) => ({
    startDate: range.start_date,
    endDateExclusive: range.end_date_exclusive,
  }));
}
