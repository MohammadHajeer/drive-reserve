import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database.types";
import {
  ADMIN_HOME_ROUTE,
  ADMIN_ONLY_ROUTES,
  createLoginUrl,
  createRedirectUrl,
  CUSTOMER_ONLY_ROUTES,
  getAppRole,
  GUEST_ONLY_ROUTES,
  matchesRoute,
  PUBLIC_ROUTES,
  redirectAuthenticatedUser,
  redirectWithCookies,
  UNAUTHORIZED_ROUTE,
} from "./route-access";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          /*
           * Pass refreshed cookies to Server Components.
           */
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          /*
           * Pass refreshed cookies back to the browser.
           */
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  /*
   * Keep this immediately after creating the client.
   * It verifies the JWT and refreshes the session when needed.
   */
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsData?.claims as Record<string, unknown> | undefined;

  const isAuthenticated = !claimsError && typeof claims?.sub === "string";

  const role = isAuthenticated ? getAppRole(claims) : undefined;

  const pathname = request.nextUrl.pathname;

  const isPublicRoute = matchesRoute(pathname, PUBLIC_ROUTES);

  const isGuestOnlyRoute = matchesRoute(pathname, GUEST_ONLY_ROUTES);

  const isCustomerRoute = matchesRoute(pathname, CUSTOMER_ONLY_ROUTES);

  const isAdminRoute = matchesRoute(pathname, ADMIN_ONLY_ROUTES);

  /*
   * Admin routes have the highest priority.
   */
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return redirectWithCookies(createLoginUrl(request), response);
    }

    if (role !== "admin") {
      return redirectWithCookies(
        createRedirectUrl(request, UNAUTHORIZED_ROUTE),
        response,
      );
    }

    return response;
  }

  /*
   * Customer routes cannot be accessed by guests or admins.
   */
  if (isCustomerRoute) {
    if (!isAuthenticated) {
      return redirectWithCookies(createLoginUrl(request), response);
    }

    if (role === "admin") {
      return redirectWithCookies(
        createRedirectUrl(request, ADMIN_HOME_ROUTE),
        response,
      );
    }

    if (role !== "customer") {
      return redirectWithCookies(
        createRedirectUrl(request, UNAUTHORIZED_ROUTE),
        response,
      );
    }

    return response;
  }

  /*
   * Logged-in users should not return to login or registration.
   */
  if (isGuestOnlyRoute) {
    if (isAuthenticated) {
      return redirectAuthenticatedUser(request, response, role);
    }

    return response;
  }

  /*
   * Public routes are accessible to everyone.
   */
  if (isPublicRoute) {
    return response;
  }

  /*
   * Unclassified routes are allowed by default.
   *
   * Sensitive routes should always be added explicitly to one
   * of the protected route arrays above.
   */
  return response;
}
