import { getCustomerAccess } from "@/lib/server/auth/get-customer-access";
import { getCustomerReservations } from "@/lib/server/customers/customer-reservations";
import {
  apiErrorResponse,
  apiSuccessResponse,
  customerAccessErrorResponse,
} from "@/lib/server/http/customer-api-response";

export async function GET() {
  const access = await getCustomerAccess();

  if (!access.authenticated || access.role !== "customer") {
    return customerAccessErrorResponse(access);
  }

  try {
    const reservations = await getCustomerReservations(
      access.supabase,
      access.userId,
    );

    return apiSuccessResponse(reservations);
  } catch (error) {
    console.error("Customer reservations load error:", error);
    return apiErrorResponse(
      500,
      "RESERVATIONS_LOAD_FAILED",
      "Unable to load your reservations.",
    );
  }
}

