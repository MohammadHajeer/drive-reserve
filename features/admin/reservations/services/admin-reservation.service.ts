import type {
  AdminReservation,
  AdminReservationApiResponse,
  AdminReservationData,
  AdminReservationsListData,
  AdminReservationsQuery,
  UpdateAdminReservationStatusVariables,
} from "../admin-reservation.types";
import { normalizeAdminReservationsQuery } from "../admin-reservation.types";

const adminReservationsPath = "/api/admin/reservations";

export class AdminReservationRequestError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[] | undefined>,
    public readonly formErrors?: string[],
  ) {
    super(message);
    this.name = "AdminReservationRequestError";
  }
}

function adminReservationPath(reservationId: string) {
  return `${adminReservationsPath}/${encodeURIComponent(reservationId)}`;
}

function buildAdminReservationsSearchParams(query: AdminReservationsQuery) {
  const normalized = normalizeAdminReservationsQuery(query);
  const searchParams = new URLSearchParams();

  if (normalized.q) searchParams.set("q", normalized.q);
  if (normalized.status) searchParams.set("status", normalized.status);
  if (normalized.pickupFrom) {
    searchParams.set("pickupFrom", normalized.pickupFrom);
  }
  if (normalized.pickupTo) searchParams.set("pickupTo", normalized.pickupTo);
  searchParams.set("sort", normalized.sort);
  searchParams.set("page", String(normalized.page));
  searchParams.set("limit", String(normalized.limit));

  return searchParams;
}

async function parseAdminReservationResponse<TData>(
  response: Response,
  fallbackMessage: string,
  fallbackCode: string,
): Promise<TData> {
  let result: AdminReservationApiResponse<TData>;

  try {
    result = (await response.json()) as AdminReservationApiResponse<TData>;
  } catch {
    throw new AdminReservationRequestError(
      "The server returned an invalid response.",
      "INVALID_RESPONSE",
      response.status,
    );
  }

  if (
    typeof result !== "object" ||
    result === null ||
    typeof result.success !== "boolean"
  ) {
    throw new AdminReservationRequestError(
      "The server returned an invalid response.",
      "INVALID_RESPONSE",
      response.status,
    );
  }

  if (!response.ok || !result.success) {
    const error = !result.success ? result.error : null;
    throw new AdminReservationRequestError(
      error?.message ?? fallbackMessage,
      error?.code ?? fallbackCode,
      response.status,
      error?.fieldErrors,
      error?.formErrors,
    );
  }

  return result.data;
}

export async function fetchAdminReservations(
  query: AdminReservationsQuery = {},
  signal?: AbortSignal,
): Promise<AdminReservationsListData> {
  const queryString = buildAdminReservationsSearchParams(query).toString();
  const response = await fetch(`${adminReservationsPath}?${queryString}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  return parseAdminReservationResponse<AdminReservationsListData>(
    response,
    "Unable to load the reservations.",
    "RESERVATIONS_LOAD_FAILED",
  );
}

export async function fetchAdminReservation(
  reservationId: string,
  signal?: AbortSignal,
): Promise<AdminReservation> {
  const response = await fetch(adminReservationPath(reservationId), {
    method: "GET",
    cache: "no-store",
    signal,
  });
  const data = await parseAdminReservationResponse<AdminReservationData>(
    response,
    "Unable to load the reservation.",
    "RESERVATION_LOAD_FAILED",
  );

  return data.reservation;
}

export async function updateAdminReservationStatus(
  variables: UpdateAdminReservationStatusVariables,
): Promise<AdminReservation> {
  const response = await fetch(
    `${adminReservationPath(variables.reservationId)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: variables.status,
        ...(variables.reason ? { reason: variables.reason } : {}),
      }),
    },
  );
  const data = await parseAdminReservationResponse<AdminReservationData>(
    response,
    "Unable to update the reservation.",
    "RESERVATION_STATUS_UPDATE_FAILED",
  );

  return data.reservation;
}
