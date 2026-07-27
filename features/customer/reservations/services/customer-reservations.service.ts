import {
  customerReservationDetailSchema,
  customerReservationsSchema,
  type CancelCustomerReservationInput,
  type CustomerReservationDetail,
} from "../customer-reservations.schema";
import {
  CustomerRequestError,
  parseCustomerApiResponse,
} from "../../customer-api";

const customerReservationsPath = "/api/customer/reservations";

export { CustomerRequestError as CustomerReservationRequestError };

function customerReservationPath(reservationId: string) {
  return `${customerReservationsPath}/${encodeURIComponent(reservationId)}`;
}

export async function fetchCustomerReservations(signal?: AbortSignal) {
  const response = await fetch(customerReservationsPath, {
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

export async function fetchCustomerReservation(
  reservationId: string,
  signal?: AbortSignal,
): Promise<CustomerReservationDetail> {
  const response = await fetch(customerReservationPath(reservationId), {
    cache: "no-store",
    signal,
  });

  return parseCustomerApiResponse(
    response,
    customerReservationDetailSchema,
    "Unable to load the reservation.",
    "RESERVATION_LOAD_FAILED",
  );
}

export async function cancelCustomerReservation({
  reservationId,
  reason,
}: CancelCustomerReservationInput & {
  reservationId: string;
}): Promise<CustomerReservationDetail> {
  const response = await fetch(`${customerReservationPath(reservationId)}/cancel`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });

  return parseCustomerApiResponse(
    response,
    customerReservationDetailSchema,
    "Unable to cancel the reservation.",
    "RESERVATION_CANCELLATION_FAILED",
  );
}
