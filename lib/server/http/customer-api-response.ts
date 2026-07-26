import "server-only";

import { NextResponse } from "next/server";

import type { CustomerAccess } from "@/lib/server/auth/get-customer-access";

export const privateNoStoreHeaders = {
  "Cache-Control": "private, no-store",
};

export function customerAccessErrorResponse(access: CustomerAccess) {
  if (!access.authenticated) {
    return apiErrorResponse(
      401,
      "UNAUTHENTICATED",
      "Authentication is required.",
    );
  }

  return apiErrorResponse(
    403,
    "FORBIDDEN",
    "Customer access is required.",
  );
}

export function apiErrorResponse(
  status: number,
  code: string,
  message: string,
  details?: {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  },
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, ...details },
    },
    { status, headers: privateNoStoreHeaders },
  );
}

export function apiSuccessResponse<TData>(
  data: TData,
  options?: { status?: number; message?: string },
) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(options?.message ? { message: options.message } : {}),
    },
    {
      status: options?.status ?? 200,
      headers: privateNoStoreHeaders,
    },
  );
}

