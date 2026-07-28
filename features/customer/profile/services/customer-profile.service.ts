import {
  customerProfileSchema,
  customerProfileStatsSchema,
  type CustomerProfile,
  type CustomerProfileStats,
  type EditableCustomerProfile,
} from "../customer-profile.schema";
import {
  CustomerRequestError,
  parseCustomerApiResponse,
} from "../../customer-api";

const customerProfilePath = "/api/customer/profile";

export { CustomerRequestError as CustomerProfileRequestError };

export async function fetchCustomerProfile(
  signal?: AbortSignal,
): Promise<CustomerProfile> {
  const response = await fetch(customerProfilePath, {
    cache: "no-store",
    signal,
  });

  return parseCustomerApiResponse(
    response,
    customerProfileSchema,
    "Unable to load your profile.",
    "PROFILE_LOAD_FAILED",
  );
}

export async function updateCustomerProfile(
  input: EditableCustomerProfile,
): Promise<CustomerProfile> {
  const response = await fetch(customerProfilePath, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseCustomerApiResponse(
    response,
    customerProfileSchema,
    "Unable to update your profile.",
    "PROFILE_UPDATE_FAILED",
  );
}

export async function fetchCustomerProfileStats(
  signal?: AbortSignal,
): Promise<CustomerProfileStats> {
  const response = await fetch(`${customerProfilePath}/stats`, {
    cache: "no-store",
    signal,
  });

  return parseCustomerApiResponse(
    response,
    customerProfileStatsSchema,
    "Unable to load your rental statistics.",
    "PROFILE_STATS_LOAD_FAILED",
  );
}
