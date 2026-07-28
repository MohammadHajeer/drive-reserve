import { getAdminCustomerById } from "@/lib/server/admin/admin-customers";
import { getAdminAccess } from "@/lib/server/auth/get-admin-access";
import {
  apiErrorResponse,
  apiSuccessResponse,
} from "@/lib/server/http/customer-api-response";
import { adminCustomerIdSchema } from "@/lib/validations/admin-customers.validation";

export async function GET(
  _request: Request,
  context: { params: Promise<{ customerId: string }> },
) {
  const { customerId } = await context.params;
  const parsedId = adminCustomerIdSchema.safeParse(customerId);

  if (!parsedId.success) {
    return apiErrorResponse(
      400,
      "INVALID_CUSTOMER_ID",
      "The provided customer ID is invalid.",
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
    const customer = await getAdminCustomerById(
      access.supabase,
      parsedId.data,
    );

    if (!customer) {
      return apiErrorResponse(
        404,
        "CUSTOMER_NOT_FOUND",
        "The requested customer was not found.",
      );
    }

    return apiSuccessResponse(customer);
  } catch (error) {
    console.error("Admin customer route error:", error);
    return apiErrorResponse(
      500,
      "CUSTOMER_LOAD_FAILED",
      "Unable to load the customer.",
    );
  }
}
