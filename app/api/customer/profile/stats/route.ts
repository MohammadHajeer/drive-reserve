import { getCustomerAccess } from "@/lib/server/auth/get-customer-access";
import { getCustomerProfileStats } from "@/lib/server/customers/customer-profile";
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
    const stats = await getCustomerProfileStats(
      access.supabase,
      access.userId,
    );

    return apiSuccessResponse(stats);
  } catch (error) {
    console.error("Customer profile stats load error:", error);
    return apiErrorResponse(
      500,
      "PROFILE_STATS_LOAD_FAILED",
      "Unable to load your rental statistics.",
    );
  }
}
