import { editableCustomerProfileSchema } from "@/features/customer/profile/customer-profile.schema";
import { getCustomerAccess } from "@/lib/server/auth/get-customer-access";
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "@/lib/server/customers/customer-profile";
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
    const profile = await getCustomerProfile(access.supabase, access.userId);

    if (!profile) {
      return apiErrorResponse(404, "PROFILE_NOT_FOUND", "Profile not found.");
    }

    return apiSuccessResponse(profile);
  } catch (error) {
    console.error("Customer profile load error:", error);
    return apiErrorResponse(
      500,
      "PROFILE_LOAD_FAILED",
      "Unable to load your profile.",
    );
  }
}

export async function PATCH(request: Request) {
  const access = await getCustomerAccess();

  if (!access.authenticated || access.role !== "customer") {
    return customerAccessErrorResponse(access);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiErrorResponse(
      400,
      "INVALID_JSON",
      "The request body must contain valid JSON.",
    );
  }

  const parsed = editableCustomerProfileSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.flatten();

    return apiErrorResponse(
      400,
      "VALIDATION_ERROR",
      "Please check the submitted profile information.",
      {
        fieldErrors: errors.fieldErrors,
        formErrors: errors.formErrors,
      },
    );
  }

  try {
    const profile = await updateCustomerProfile(
      access.supabase,
      access.userId,
      parsed.data,
    );

    if (!profile) {
      return apiErrorResponse(404, "PROFILE_NOT_FOUND", "Profile not found.");
    }

    return apiSuccessResponse(profile, {
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("Customer profile update error:", error);
    return apiErrorResponse(
      500,
      "PROFILE_UPDATE_FAILED",
      "Unable to update your profile.",
    );
  }
}

