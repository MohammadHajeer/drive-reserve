import type {
  AdminCustomerApiResponse,
  AdminCustomerDetails,
  AdminCustomersListData,
  AdminCustomersQuery,
} from "../admin-customer.types";
import { normalizeAdminCustomersQuery } from "../admin-customer.types";

const adminCustomersPath = "/api/admin/customers";

export class AdminCustomerRequestError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[] | undefined>,
    public readonly formErrors?: string[],
  ) {
    super(message);
    this.name = "AdminCustomerRequestError";
  }
}

function adminCustomerPath(customerId: string) {
  return `${adminCustomersPath}/${encodeURIComponent(customerId)}`;
}

function buildAdminCustomersSearchParams(query: AdminCustomersQuery) {
  const normalized = normalizeAdminCustomersQuery(query);
  const searchParams = new URLSearchParams();

  if (normalized.q) searchParams.set("q", normalized.q);
  if (normalized.sort !== "newest") {
    searchParams.set("sort", normalized.sort);
  }
  if (normalized.joinedFrom) {
    searchParams.set("joinedFrom", normalized.joinedFrom);
  }
  if (normalized.joinedTo) {
    searchParams.set("joinedTo", normalized.joinedTo);
  }
  searchParams.set("page", String(normalized.page));
  searchParams.set("limit", String(normalized.limit));

  return searchParams;
}

async function parseAdminCustomerResponse<TData>(
  response: Response,
  fallbackMessage: string,
  fallbackCode: string,
): Promise<TData> {
  let result: AdminCustomerApiResponse<TData>;

  try {
    result = (await response.json()) as AdminCustomerApiResponse<TData>;
  } catch {
    throw new AdminCustomerRequestError(
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
    throw new AdminCustomerRequestError(
      "The server returned an invalid response.",
      "INVALID_RESPONSE",
      response.status,
    );
  }

  if (!response.ok || !result.success) {
    const error = !result.success ? result.error : null;
    throw new AdminCustomerRequestError(
      error?.message ?? fallbackMessage,
      error?.code ?? fallbackCode,
      response.status,
      error?.fieldErrors,
      error?.formErrors,
    );
  }

  return result.data;
}

export async function fetchAdminCustomers(
  query: AdminCustomersQuery = {},
  signal?: AbortSignal,
): Promise<AdminCustomersListData> {
  const queryString = buildAdminCustomersSearchParams(query).toString();
  const response = await fetch(`${adminCustomersPath}?${queryString}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  return parseAdminCustomerResponse<AdminCustomersListData>(
    response,
    "Unable to load the customers.",
    "CUSTOMERS_LOAD_FAILED",
  );
}

export async function fetchAdminCustomer(
  customerId: string,
  signal?: AbortSignal,
): Promise<AdminCustomerDetails> {
  const response = await fetch(adminCustomerPath(customerId), {
    method: "GET",
    cache: "no-store",
    signal,
  });

  return parseAdminCustomerResponse<AdminCustomerDetails>(
    response,
    "Unable to load the customer.",
    "CUSTOMER_LOAD_FAILED",
  );
}
