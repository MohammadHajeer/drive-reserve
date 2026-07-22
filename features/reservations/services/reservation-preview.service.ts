import type {
  ReservationPreview,
  ReservationPreviewApiResponse,
  ReservationPreviewInput,
} from "../reservation.types";

export class ReservationPreviewRequestError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ReservationPreviewRequestError";
  }
}

export async function fetchReservationPreview(
  input: ReservationPreviewInput,
  signal?: AbortSignal,
): Promise<ReservationPreview> {
  const response = await fetch("/api/reservations/preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
    signal,
  });

  let result: ReservationPreviewApiResponse;

  try {
    result = (await response.json()) as ReservationPreviewApiResponse;
  } catch {
    throw new ReservationPreviewRequestError(
      "The server returned an invalid response.",
      "INVALID_RESPONSE",
    );
  }

  if (!response.ok || !result.success) {
    const error = !result.success ? result.error : null;

    throw new ReservationPreviewRequestError(
      error?.message ?? "Unable to preview this reservation.",
      error?.code ?? "PREVIEW_FAILED",
      error?.fieldErrors,
    );
  }

  return result.data;
}
