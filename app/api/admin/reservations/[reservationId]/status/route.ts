import { getAdminReservationById } from "@/lib/server/admin/admin-reservations";
import { getAdminAccess } from "@/lib/server/auth/get-admin-access";
import {
  apiErrorResponse,
  apiSuccessResponse,
} from "@/lib/server/http/customer-api-response";
import {
  adminReservationIdSchema,
  updateAdminReservationStatusSchema,
} from "@/lib/validations/admin-reservations.validation";

function reservationStatusError(message: string) {
  if (message.includes("Reservation not found")) {
    return apiErrorResponse(
      404,
      "RESERVATION_NOT_FOUND",
      "The requested reservation was not found.",
    );
  }
  if (
    message.includes("Invalid reservation transition") ||
    message.includes("Only pending reservations can be confirmed") ||
    message.includes("is final and cannot be changed")
  ) {
    return apiErrorResponse(
      409,
      "INVALID_STATUS_TRANSITION",
      "That status change is no longer allowed. Refresh and try again.",
    );
  }
  if (message.includes("reason is required")) {
    return apiErrorResponse(400, "REASON_REQUIRED", message);
  }
  if (message.includes("Administrator access is required")) {
    return apiErrorResponse(
      403,
      "FORBIDDEN",
      "Administrator access is required.",
    );
  }

  return apiErrorResponse(
    500,
    "RESERVATION_STATUS_UPDATE_FAILED",
    "Unable to update the reservation status.",
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ reservationId: string }> },
) {
  const { reservationId } = await context.params;
  const parsedId = adminReservationIdSchema.safeParse(reservationId);

  if (!parsedId.success) {
    return apiErrorResponse(
      400,
      "INVALID_RESERVATION_ID",
      "The provided reservation ID is invalid.",
    );
  }

  const access = await getAdminAccess();
  if (!access.authenticated) {
    return apiErrorResponse(
      401,
      "UNAUTHENTICATED",
      "Authentication is required.",
    );
  }
  if (access.role !== "admin") {
    return apiErrorResponse(
      403,
      "FORBIDDEN",
      "Administrator access is required.",
    );
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

  const parsedBody = updateAdminReservationStatusSchema.safeParse(body);
  if (!parsedBody.success) {
    return apiErrorResponse(
      400,
      "VALIDATION_ERROR",
      "Please check the reservation status update.",
      {
        fieldErrors: parsedBody.error.flatten().fieldErrors,
        formErrors: parsedBody.error.flatten().formErrors,
      },
    );
  }

  try {
    const { status, reason } = parsedBody.data;
    const { error } = await access.supabase.rpc(
      "admin_update_reservation_status",
      {
        p_reservation_id: parsedId.data,
        p_status: status,
        ...(reason ? { p_reason: reason } : {}),
      },
    );

    if (error) {
      console.error("Admin reservation status RPC error:", error);
      return reservationStatusError(error.message);
    }

    const loaded = await getAdminReservationById(
      access.supabase,
      parsedId.data,
    );
    if (loaded.error) {
      console.error("Updated admin reservation reload error:", loaded.error);
      return apiErrorResponse(
        500,
        "RESERVATION_RELOAD_FAILED",
        "The status was updated, but the reservation could not be reloaded.",
      );
    }
    if (!loaded.reservation) {
      return apiErrorResponse(
        404,
        "RESERVATION_NOT_FOUND",
        "The requested reservation was not found.",
      );
    }

    return apiSuccessResponse(
      { reservation: loaded.reservation },
      { message: "Reservation status updated successfully." },
    );
  } catch (error) {
    console.error("Admin reservation status route error:", error);
    return apiErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred.",
    );
  }
}
