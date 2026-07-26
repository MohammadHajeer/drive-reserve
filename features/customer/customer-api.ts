import type { ZodType } from "zod";

export class CustomerRequestError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[] | undefined>,
    public readonly formErrors?: string[],
  ) {
    super(message);
    this.name = "CustomerRequestError";
  }
}

export async function parseCustomerApiResponse<TData>(
  response: Response,
  schema: ZodType<TData>,
  fallbackMessage: string,
  fallbackCode: string,
): Promise<TData> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw invalidResponseError(response.status);
  }

  if (!isRecord(payload) || typeof payload.success !== "boolean") {
    throw invalidResponseError(response.status);
  }

  if (!response.ok || !payload.success) {
    const error = isRecord(payload.error) ? payload.error : undefined;

    throw new CustomerRequestError(
      typeof error?.message === "string" ? error.message : fallbackMessage,
      typeof error?.code === "string" ? error.code : fallbackCode,
      response.status,
      parseFieldErrors(error?.fieldErrors),
      parseStringArray(error?.formErrors),
    );
  }

  const parsed = schema.safeParse(payload.data);

  if (!parsed.success) {
    throw invalidResponseError(response.status);
  }

  return parsed.data;
}

function invalidResponseError(status: number) {
  return new CustomerRequestError(
    "The server returned an invalid response.",
    "INVALID_RESPONSE",
    status,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
}

function parseFieldErrors(value: unknown) {
  if (!isRecord(value)) return undefined;

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string[]] =>
      Array.isArray(entry[1]) &&
      entry[1].every((item) => typeof item === "string"),
  );

  return Object.fromEntries(entries);
}

