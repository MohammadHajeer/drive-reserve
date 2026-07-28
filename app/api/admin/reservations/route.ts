import type { NextRequest } from "next/server";
import { z } from "zod";

import type {
  AdminReservationsSummary,
  AdminReservationsSort,
} from "@/features/admin/reservations/admin-reservation.types";
import {
  ADMIN_RESERVATION_SELECT,
  mapAdminReservation,
} from "@/lib/server/admin/admin-reservations";
import {
  getAdminAccess,
  type AdminAccess,
} from "@/lib/server/auth/get-admin-access";
import {
  apiErrorResponse,
  apiSuccessResponse,
} from "@/lib/server/http/customer-api-response";
import { adminReservationsQuerySchema } from "@/lib/validations/admin-reservations.validation";
import { RESERVATION_STATUSES } from "@/types/domain";

const sortOptions: Record<
  AdminReservationsSort,
  { column: "created_at" | "pickup_date" | "total_price"; ascending: boolean }
> = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  "pickup-asc": { column: "pickup_date", ascending: true },
  "pickup-desc": { column: "pickup_date", ascending: false },
  "total-asc": { column: "total_price", ascending: true },
  "total-desc": { column: "total_price", ascending: false },
};

function adminAccessErrorResponse(access: AdminAccess) {
  return access.authenticated
    ? apiErrorResponse(403, "FORBIDDEN", "Administrator access is required.")
    : apiErrorResponse(401, "UNAUTHENTICATED", "Authentication is required.");
}

export async function GET(request: NextRequest) {
  const access = await getAdminAccess();

  if (!access.authenticated || access.role !== "admin") {
    return adminAccessErrorResponse(access);
  }

  const searchParams = request.nextUrl.searchParams;
  const parsed = adminReservationsQuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    status: searchParams.get("status") || undefined,
    pickupFrom: searchParams.get("pickupFrom") || undefined,
    pickupTo: searchParams.get("pickupTo") || undefined,
    sort: searchParams.get("sort") ?? "newest",
    page: searchParams.get("page") ?? "1",
    limit: searchParams.get("limit") ?? "10",
  });

  if (!parsed.success) {
    return apiErrorResponse(
      400,
      "INVALID_QUERY_PARAMETERS",
      "Please check the selected reservation filters.",
      {
        fieldErrors: parsed.error.flatten().fieldErrors,
        formErrors: parsed.error.flatten().formErrors,
      },
    );
  }

  const { q, status, pickupFrom, pickupTo, sort, page, limit } = parsed.data;
  try {
    const searchFilters: string[] = [];

    if (q) {
      const [profilesResult, brandsResult, modelsResult, platesResult] =
        await Promise.all([
        access.supabase
          .from("profiles")
          .select("id")
          .ilike("full_name", `%${q}%`),
        access.supabase
          .from("cars")
          .select("id")
          .ilike("brand", `%${q}%`),
        access.supabase
          .from("cars")
          .select("id")
          .ilike("model", `%${q}%`),
        access.supabase
          .from("cars")
          .select("id")
          .ilike("plate_number", `%${q}%`),
      ]);

      if (
        profilesResult.error ||
        brandsResult.error ||
        modelsResult.error ||
        platesResult.error
      ) {
        console.error("Admin reservation search lookup error:", {
          profiles: profilesResult.error,
          brands: brandsResult.error,
          models: modelsResult.error,
          plates: platesResult.error,
        });
        return apiErrorResponse(
          500,
          "RESERVATIONS_LOAD_FAILED",
          "Unable to load the reservations.",
        );
      }

      const parsedId = z.uuid().safeParse(q);
      if (parsedId.success) searchFilters.push(`id.eq.${parsedId.data}`);

      const customerIds = (profilesResult.data ?? []).map((profile) => profile.id);
      if (customerIds.length > 0) {
        searchFilters.push(`customer_id.in.(${customerIds.join(",")})`);
      }

      const carIds = Array.from(
        new Set(
          [brandsResult, modelsResult, platesResult].flatMap((result) =>
            (result.data ?? []).map((car) => car.id),
          ),
        ),
      );
      if (carIds.length > 0) {
        searchFilters.push(`car_id.in.(${carIds.join(",")})`);
      }
    }

    let query = access.supabase.from("reservations").select(
      ADMIN_RESERVATION_SELECT,
      { count: "exact" },
    );

    if (q) {
      if (searchFilters.length === 0) {
        query = query.eq("id", "00000000-0000-0000-0000-000000000000");
      } else {
        query = query.or(searchFilters.join(","));
      }
    }

    if (status) query = query.eq("status", status);
    if (pickupFrom) query = query.gte("pickup_date", pickupFrom);
    if (pickupTo) query = query.lte("pickup_date", pickupTo);

    const sortOption = sortOptions[sort];
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const summaryPromise = Promise.all(
      RESERVATION_STATUSES.map(async (reservationStatus) => {
        const result = await access.supabase
          .from("reservations")
          .select("id", { count: "exact", head: true })
          .eq("status", reservationStatus);
        return { reservationStatus, result };
      }),
    );
    const [{ data, count, error }, summaryResults] = await Promise.all([
      query
        .order(sortOption.column, { ascending: sortOption.ascending })
        .order("id", { ascending: true })
        .range(from, to),
      summaryPromise,
    ]);

    if (error) {
      console.error("Admin reservations load error:", error);
      return apiErrorResponse(
        500,
        "RESERVATIONS_LOAD_FAILED",
        "Unable to load the reservations.",
      );
    }

    const summary = summaryResults.reduce<AdminReservationsSummary>(
      (counts, summaryResult) => {
        if (summaryResult.result.error) {
          throw summaryResult.result.error;
        }
        const countForStatus = summaryResult.result.count ?? 0;
        counts[summaryResult.reservationStatus] = countForStatus;
        counts.all += countForStatus;
        return counts;
      },
      {
        all: 0,
        pending: 0,
        confirmed: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0,
      },
    );
    const total = count ?? 0;

    return apiSuccessResponse({
      reservations: (data ?? []).map((reservation) =>
        mapAdminReservation(access.supabase, reservation),
      ),
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Admin reservations route error:", error);
    return apiErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred.",
    );
  }
}
