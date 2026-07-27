import { getAdminReservationById } from "@/lib/server/admin/admin-reservations";
import { getAdminAccess } from "@/lib/server/auth/get-admin-access";
import {
  apiErrorResponse,
  apiSuccessResponse,
} from "@/lib/server/http/customer-api-response";
import { adminReservationIdSchema } from "@/lib/validations/admin-reservations.validation";

export async function GET(
  _request: Request,
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

  try {
    const { reservation, error } = await getAdminReservationById(
      access.supabase,
      parsedId.data,
    );

    if (error) {
      console.error("Admin reservation load error:", error);
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

    return apiSuccessResponse({ reservation });
  } catch (error) {
    console.error("Admin reservation route error:", error);
    return apiErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred.",
    );
  }
}
