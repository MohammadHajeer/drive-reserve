import {
  customerReservationIdSchema,
} from "@/features/customer/reservations/customer-reservations.schema";
import { getCustomerAccess } from "@/lib/server/auth/get-customer-access";
import { getCustomerReservationById } from "@/lib/server/customers/customer-reservations";
import {
  apiErrorResponse,
  apiSuccessResponse,
  customerAccessErrorResponse,
} from "@/lib/server/http/customer-api-response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ reservationId: string }> },
) {
  const { reservationId } = await context.params;
  const parsedId = customerReservationIdSchema.safeParse(reservationId);

  if (!parsedId.success) {
    return apiErrorResponse(
      400,
      "INVALID_RESERVATION_ID",
      "The provided reservation ID is invalid.",
    );
  }

  const access = await getCustomerAccess();

  if (!access.authenticated || access.role !== "customer") {
    return customerAccessErrorResponse(access);
  }

  try {
    const { reservation, error } = await getCustomerReservationById(
      access.supabase,
      access.userId,
      access.email,
      parsedId.data,
    );

    if (error) {
      console.error("Customer reservation load error:", error);
      return apiErrorResponse(
        500,
        "RESERVATION_LOAD_FAILED",
        "Unable to load the reservation.",
      );
    }

    if (!reservation) {
      return apiErrorResponse(
        404,
        "RESERVATION_NOT_FOUND",
        "The requested reservation was not found.",
      );
    }

    return apiSuccessResponse(reservation);
  } catch (error) {
    console.error("Customer reservation route error:", error);
    return apiErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred.",
    );
  }
}
