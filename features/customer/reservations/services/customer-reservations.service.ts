import { customerReservationsSchema } from "../customer-reservations.schema";
import { parseCustomerApiResponse } from "../../customer-api";

export async function fetchCustomerReservations(signal?: AbortSignal) {
  const response = await fetch("/api/customer/reservations", {
    cache: "no-store",
    signal,
  });

  return parseCustomerApiResponse(
    response,
    customerReservationsSchema,
    "Unable to load your reservations.",
    "RESERVATIONS_LOAD_FAILED",
  );
}
