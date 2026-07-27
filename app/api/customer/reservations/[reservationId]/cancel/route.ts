import {
  cancelCustomerReservationSchema,
  customerReservationIdSchema,
} from "@/features/customer/reservations/customer-reservations.schema";
import { getCustomerAccess } from "@/lib/server/auth/get-customer-access";
import { getCustomerReservationById } from "@/lib/server/customers/customer-reservations";
import {
  apiErrorResponse,
  apiSuccessResponse,
  customerAccessErrorResponse,
} from "@/lib/server/http/customer-api-response";

function cancellationErrorResponse(message: string) {
  if (message.includes("Reservation not found")) {
    return apiErrorResponse(
      404,
      "RESERVATION_NOT_FOUND",
      "The requested reservation was not found.",
    );
  }

  if (message.includes("Only pending or confirmed reservations")) {
    return apiErrorResponse(
      409,
      "CANCELLATION_NOT_ALLOWED",
      "This reservation can no longer be cancelled.",
    );
  }

  if (message.includes("cancellation reason is required")) {
    return apiErrorResponse(
      400,
      "CANCELLATION_REASON_REQUIRED",
      "A cancellation reason is required.",
    );
  }

  return apiErrorResponse(
    500,
    "RESERVATION_CANCELLATION_FAILED",
    "Unable to cancel the reservation.",
  );
}

async function loadReservation(
  access: Extract<
    Awaited<ReturnType<typeof getCustomerAccess>>,
    { authenticated: true; role: "customer" }
  >,
  reservationId: string,
) {
  return getCustomerReservationById(
    access.supabase,
    access.userId,
    access.email,
    reservationId,
  );
}

export async function PATCH(
  request: Request,
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiErrorResponse(
      400,
      "INVALID_JSON",
      "The request body must contain valid JSON.",
    );
  }

  const parsedBody = cancelCustomerReservationSchema.safeParse(body);

  if (!parsedBody.success) {
    const errors = parsedBody.error.flatten();

    return apiErrorResponse(
      400,
      "VALIDATION_ERROR",
      "Please check the cancellation reason.",
      {
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors,
      },
    );
  }

  try {
    const { error } = await access.supabase.rpc("cancel_my_reservation", {
      p_reservation_id: parsedId.data,
      p_reason: parsedBody.data.reason,
    });

    if (error) {
      const current = await loadReservation(access, parsedId.data);

      if (!current.error && current.reservation?.status === "cancelled") {
        return apiSuccessResponse(current.reservation, {
          message: "Reservation cancelled successfully.",
        });
      }

      console.error("Customer reservation cancellation RPC error:", error);
      return cancellationErrorResponse(error.message);
    }

    const updated = await loadReservation(access, parsedId.data);

    if (updated.error) {
      console.error("Cancelled customer reservation reload error:", updated.error);
      return apiErrorResponse(
        500,
        "RESERVATION_RELOAD_FAILED",
        "The reservation was cancelled but could not be reloaded.",
      );
    }

    if (!updated.reservation) {
      return apiErrorResponse(
        404,
        "RESERVATION_NOT_FOUND",
        "The requested reservation was not found.",
      );
    }

    return apiSuccessResponse(updated.reservation, {
      message: "Reservation cancelled successfully.",
    });
  } catch (error) {
    console.error("Customer reservation cancellation route error:", error);
    return apiErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred.",
    );
  }
}
