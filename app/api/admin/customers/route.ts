import type { NextRequest } from "next/server";

import {
  getAdminCustomersList,
  getAdminCustomersSummary,
} from "@/lib/server/admin/admin-customers";
import {
  getAdminAccess,
  type AdminAccess,
} from "@/lib/server/auth/get-admin-access";
import {
  apiErrorResponse,
  apiSuccessResponse,
} from "@/lib/server/http/customer-api-response";
import { adminCustomersQuerySchema } from "@/lib/validations/admin-customers.validation";

function adminAccessErrorResponse(access: AdminAccess) {
  return access.authenticated
    ? apiErrorResponse(403, "FORBIDDEN", "Administrator access is required.")
    : apiErrorResponse(401, "UNAUTHENTICATED", "Authentication is required.");
}

export async function GET(request: NextRequest) {
  const access = await getAdminAccess();

  if (!access.authenticated || access.role !== "admin") {
    return adminAccessErrorResponse(access);
  }

  const searchParams = request.nextUrl.searchParams;
  const parsed = adminCustomersQuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    sort: searchParams.get("sort") ?? "newest",
    joinedFrom: searchParams.get("joinedFrom") || undefined,
    joinedTo: searchParams.get("joinedTo") || undefined,
    page: searchParams.get("page") ?? "1",
    limit: searchParams.get("limit") ?? "6",
  });

  if (!parsed.success) {
    return apiErrorResponse(
      400,
      "INVALID_QUERY_PARAMETERS",
      "Please check the selected customer filters.",
      {
        fieldErrors: parsed.error.flatten().fieldErrors,
        formErrors: parsed.error.flatten().formErrors,
      },
    );
  }

  try {
    const [list, summary] = await Promise.all([
      getAdminCustomersList(access.supabase, parsed.data),
      getAdminCustomersSummary(access.supabase),
    ]);

    return apiSuccessResponse({ ...list, summary });
  } catch (error) {
    console.error("Admin customers route error:", error);
    return apiErrorResponse(
      500,
      "CUSTOMERS_LOAD_FAILED",
      "Unable to load the customers.",
    );
  }
}
