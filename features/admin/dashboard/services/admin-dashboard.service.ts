import { adminDashboardDataSchema } from "../admin-dashboard.types";
import type { AdminDashboardData } from "../admin-dashboard.types";

const adminDashboardPath = "/api/admin/dashboard";

export class AdminDashboardRequestError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AdminDashboardRequestError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function getAdminDashboard(
  signal?: AbortSignal,
): Promise<AdminDashboardData> {
  const response = await fetch(adminDashboardPath, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new AdminDashboardRequestError(
      "The server returned an invalid response.",
      "INVALID_RESPONSE",
      response.status,
    );
  }

  if (!response.ok) {
    const error = isRecord(result) && isRecord(result.error)
      ? result.error
      : null;

    throw new AdminDashboardRequestError(
      typeof error?.message === "string"
        ? error.message
        : "Unable to load the dashboard.",
      typeof error?.code === "string" ? error.code : "DASHBOARD_LOAD_FAILED",
      response.status,
    );
  }

  const parsed = isRecord(result) && result.success === true
    ? adminDashboardDataSchema.safeParse(result.data)
    : null;

  if (!parsed?.success) {
    throw new AdminDashboardRequestError(
      "The server returned an invalid dashboard response.",
      "INVALID_RESPONSE",
      response.status,
    );
  }

  return parsed.data;
}
