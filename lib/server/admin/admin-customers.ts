import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AdminCustomerDetails,
  AdminCustomerListItem,
  AdminCustomerReservation,
  AdminCustomersQuery,
  AdminCustomersSummary,
} from "@/features/admin/customers/admin-customer.types";
import { normalizeAdminCustomersQuery } from "@/features/admin/customers/admin-customer.types";
import {
  ADMIN_RESERVATION_SELECT,
  mapAdminReservation,
} from "@/lib/server/admin/admin-reservations";
import { createAdminClient } from "@/lib/supabase/admin";
import { addDaysToDateOnly, getBeirutDateOnly } from "@/lib/reservations/reservation-date";
import type { Database } from "@/types/database.types";
import type { ReservationStatus } from "@/types/domain";

type AdminSupabaseClient = SupabaseClient<Database>;

function escapePostgrestQuotedValue(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

async function getCustomerEmail(customerId: string): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(customerId);

    if (error) {
      console.error("Admin customer email lookup error:", error);
      return null;
    }

    return data.user?.email ?? null;
  } catch (error) {
    console.error("Admin customer email lookup failed:", error);
    return null;
  }
}

export async function getAdminCustomersList(
  supabase: AdminSupabaseClient,
  input: AdminCustomersQuery,
) {
  const query = normalizeAdminCustomersQuery(input);
  let profilesQuery = supabase
    .from("profiles")
    .select("id, full_name, phone, created_at, updated_at", {
      count: "exact",
    })
    .eq("role", "customer");

  if (query.q) {
    const search = escapePostgrestQuotedValue(query.q);
    profilesQuery = profilesQuery.or(
      `full_name.ilike."%${search}%",phone.ilike."%${search}%"`,
    );
  }
  if (query.joinedFrom) {
    profilesQuery = profilesQuery.gte("created_at", query.joinedFrom);
  }
  if (query.joinedTo) {
    profilesQuery = profilesQuery.lt(
      "created_at",
      addDaysToDateOnly(query.joinedTo, 1),
    );
  }

  const from = (query.page - 1) * query.limit;
  const to = from + query.limit - 1;
  const { data: profiles, count, error } = await profilesQuery
    .order("created_at", { ascending: query.sort === "oldest" })
    .order("id", { ascending: true })
    .range(from, to);

  if (error) throw error;

  const customerIds = (profiles ?? []).map((profile) => profile.id);
  const reservationResult =
    customerIds.length > 0
      ? await supabase
          .from("reservations")
          .select("customer_id, status, total_price")
          .in("customer_id", customerIds)
      : { data: [], error: null };

  if (reservationResult.error) throw reservationResult.error;

  const statistics = new Map<
    string,
    Pick<
      AdminCustomerListItem,
      | "totalReservations"
      | "activeReservations"
      | "completedReservations"
      | "totalSpent"
    >
  >();

  for (const reservation of reservationResult.data ?? []) {
    const current = statistics.get(reservation.customer_id) ?? {
      totalReservations: 0,
      activeReservations: 0,
      completedReservations: 0,
      totalSpent: 0,
    };
    current.totalReservations += 1;
    if (reservation.status === "active") current.activeReservations += 1;
    if (reservation.status === "completed") {
      current.completedReservations += 1;
      current.totalSpent += Number(reservation.total_price ?? 0);
    }
    statistics.set(reservation.customer_id, current);
  }

  const customers: AdminCustomerListItem[] = (profiles ?? []).map(
    (profile) => ({
      id: profile.id,
      fullName: profile.full_name,
      phone: profile.phone,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      ...(statistics.get(profile.id) ?? {
        totalReservations: 0,
        activeReservations: 0,
        completedReservations: 0,
        totalSpent: 0,
      }),
    }),
  );
  const totalItems = count ?? 0;

  return {
    customers,
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / query.limit),
      hasNextPage: query.page * query.limit < totalItems,
      hasPreviousPage: query.page > 1,
    },
  };
}

export async function getAdminCustomersSummary(
  supabase: AdminSupabaseClient,
): Promise<AdminCustomersSummary> {
  const today = getBeirutDateOnly();
  const firstDayOfMonth = `${today.slice(0, 7)}-01`;
  const [total, active, upcoming, newThisMonth] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "confirmed"])
      .gte("pickup_date", today),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", firstDayOfMonth),
  ]);

  const error =
    total.error ?? active.error ?? upcoming.error ?? newThisMonth.error;
  if (error) throw error;

  return {
    totalCustomers: total.count ?? 0,
    activeReservations: active.count ?? 0,
    upcomingReservations: upcoming.count ?? 0,
    newCustomersThisMonth: newThisMonth.count ?? 0,
  };
}

export async function getAdminCustomerById(
  supabase: AdminSupabaseClient,
  customerId: string,
): Promise<AdminCustomerDetails | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at, updated_at")
    .eq("id", customerId)
    .eq("role", "customer")
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return null;

  const [reservationResult, email] = await Promise.all([
    supabase
      .from("reservations")
      .select(ADMIN_RESERVATION_SELECT)
      .eq("customer_id", customerId),
    getCustomerEmail(customerId),
  ]);

  if (reservationResult.error) throw reservationResult.error;

  const reservations: AdminCustomerReservation[] = (
    reservationResult.data ?? []
  ).map((row) => {
    const reservation = mapAdminReservation(supabase, row);
    return {
      id: reservation.id,
      car: reservation.car,
      pickupDate: reservation.pickupDate,
      returnDate: reservation.returnDate,
      rentalDays: reservation.rentalDays,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      createdAt: reservation.createdAt,
    };
  });
  const counts: Record<ReservationStatus, number> = {
    pending: 0,
    confirmed: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
  };
  let totalSpent = 0;

  for (const reservation of reservations) {
    counts[reservation.status] += 1;
    if (reservation.status === "completed") {
      totalSpent += reservation.totalPrice;
    }
  }

  const byPickupAscending = (
    first: AdminCustomerReservation,
    second: AdminCustomerReservation,
  ) =>
    first.pickupDate.localeCompare(second.pickupDate) ||
    first.id.localeCompare(second.id);
  const byPickupDescending = (
    first: AdminCustomerReservation,
    second: AdminCustomerReservation,
  ) => byPickupAscending(second, first);

  return {
    customer: {
      id: profile.id,
      fullName: profile.full_name,
      email,
      phone: profile.phone,
      role: "customer",
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    },
    statistics: {
      totalReservations: reservations.length,
      pendingReservations: counts.pending,
      confirmedReservations: counts.confirmed,
      activeReservations: counts.active,
      completedReservations: counts.completed,
      cancelledReservations: counts.cancelled,
      rejectedReservations: counts.rejected,
      totalSpent,
    },
    currentReservations: reservations
      .filter((reservation) => reservation.status === "active")
      .sort(byPickupAscending),
    upcomingReservations: reservations
      .filter(
        (reservation) =>
          reservation.status === "pending" ||
          reservation.status === "confirmed",
      )
      .sort(byPickupAscending),
    reservationHistory: reservations
      .filter(
        (reservation) =>
          reservation.status === "completed" ||
          reservation.status === "cancelled" ||
          reservation.status === "rejected",
      )
      .sort(byPickupDescending),
  };
}
