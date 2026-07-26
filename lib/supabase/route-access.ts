import { NextRequest, NextResponse } from "next/server";

export type AppRole = "customer" | "admin";

/*
 * These routes are accessible to everyone.
 *
 * A parent route also matches its nested routes:
 * "/cars" matches "/cars", "/cars/toyota-corolla", etc.
 */
export const PUBLIC_ROUTES = [
  "/",
  "/cars",
  "/about",
  "/how-it-works",
  "/unauthorized",

  // Supabase authentication flow routes
  "/auth/callback",
  "/auth/confirm",

  /*
   * Keep reset-password public because a recovery flow may create
   * an authenticated recovery session before opening this page.
   */
  "/reset-password",
] as const;

/*
 * Only unauthenticated users should access these pages.
 */
export const GUEST_ONLY_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
] as const;

/*
 * Only customers may access these routes.
 */
export const CUSTOMER_ONLY_ROUTES = [
  "/profile",
  "/my-reservations",
  "/reservations",
  /^\/cars\/[^/]+\/confirm-reservation$/,
] as const;

/*
 * "/admin" automatically protects all nested admin pages.
 */
export const ADMIN_ONLY_ROUTES = ["/admin"] as const;

export const LOGIN_ROUTE = "/login";
export const CUSTOMER_HOME_ROUTE = "/cars";
export const ADMIN_HOME_ROUTE = "/admin";
export const UNAUTHORIZED_ROUTE = "/unauthorized";

export function matchesRoute(
  pathname: string,
  routes: readonly (string | RegExp)[],
): boolean {
  return routes.some((route) =>
    typeof route === "string"
      ? pathname === route || pathname.startsWith(`${route}/`)
      : route.test(pathname),
  );
}

export function getAppRole(
  claims: Record<string, unknown> | undefined,
): AppRole | undefined {
  const role = claims?.user_role;

  if (role === "customer" || role === "admin") {
    return role;
  }

  return undefined;
}

export function createRedirectUrl(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();

  url.pathname = pathname;
  url.search = "";

  return url;
}

export function createLoginUrl(request: NextRequest) {
  const loginUrl = createRedirectUrl(request, LOGIN_ROUTE);

  const requestedPath = request.nextUrl.pathname + request.nextUrl.search;

  loginUrl.searchParams.set("redirectTo", requestedPath);

  return loginUrl;
}

/*
 * Preserve refreshed Supabase cookies when returning a redirect.
 */
export function redirectWithCookies(url: URL, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export function redirectAuthenticatedUser(
  request: NextRequest,
  response: NextResponse,
  role: AppRole | undefined,
) {
  if (role === "admin") {
    return redirectWithCookies(
      createRedirectUrl(request, ADMIN_HOME_ROUTE),
      response,
    );
  }

  if (role === "customer") {
    return redirectWithCookies(
      createRedirectUrl(request, CUSTOMER_HOME_ROUTE),
      response,
    );
  }

  return redirectWithCookies(
    createRedirectUrl(request, UNAUTHORIZED_ROUTE),
    response,
  );
}
