import { getAdminDashboardData } from "@/lib/server/admin/admin-dashboard";
import {
  getAdminAccess,
  type AdminAccess,
} from "@/lib/server/auth/get-admin-access";
import {
  apiErrorResponse,
  apiSuccessResponse,
} from "@/lib/server/http/customer-api-response";

function adminAccessErrorResponse(access: AdminAccess) {
  return access.authenticated
    ? apiErrorResponse(403, "FORBIDDEN", "Administrator access is required.")
    : apiErrorResponse(401, "UNAUTHENTICATED", "Authentication is required.");
}

export async function GET() {
  const access = await getAdminAccess();

  if (!access.authenticated || access.role !== "admin") {
    return adminAccessErrorResponse(access);
  }

  try {
    const dashboard = await getAdminDashboardData(access.supabase);
    return apiSuccessResponse(dashboard);
  } catch (error) {
    console.error("Admin dashboard route error:", error);
    return apiErrorResponse(
      500,
      "DASHBOARD_LOAD_FAILED",
      "Unable to load the dashboard.",
    );
  }
}
