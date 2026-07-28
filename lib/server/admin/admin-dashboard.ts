import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DASHBOARD_FLEET_STATUSES,
  type AdminDashboardData,
  type FleetStatus,
  type ReservationsChartItem,
  type RevenueChartItem,
} from "@/features/admin/dashboard/admin-dashboard.types";
import {
  getBeirutDateOnly,
  RESERVATION_TIME_ZONE,
} from "@/lib/reservations/reservation-date";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

const DASHBOARD_MONTH_COUNT = 6;
const RECENT_RESERVATION_LIMIT = 5;
const RECENT_CUSTOMER_LIMIT = 4;

type AdminSupabaseClient = SupabaseClient<Database>;

const beirutYearMonthFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: RESERVATION_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
});

const beirutDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: RESERVATION_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function getMonthStart(value: string, offset = 0) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function getBeirutYearMonth(value: string) {
  const parts = beirutYearMonthFormatter.formatToParts(new Date(value));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  if (!year || !month) {
    throw new Error("Unable to determine a reservation month.");
  }

  return `${year}-${month}`;
}

function getBeirutDayStartInstant(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const targetWallTime = Date.UTC(year, month - 1, day);
  let instant = targetWallTime;

  // Iterating accounts for the UTC offset on the target date, including DST.
  for (let iteration = 0; iteration < 2; iteration += 1) {
    const parts = beirutDateTimeFormatter.formatToParts(new Date(instant));
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((item) => item.type === type)?.value);
    const representedWallTime = Date.UTC(
      part("year"),
      part("month") - 1,
      part("day"),
      part("hour"),
      part("minute"),
      part("second"),
    );
    instant += targetWallTime - representedWallTime;
  }

  return new Date(instant).toISOString();
}

function getMonthBuckets(today: string) {
  const currentMonth = getMonthStart(today);

  return Array.from({ length: DASHBOARD_MONTH_COUNT }, (_, index) =>
    getMonthStart(currentMonth, index - DASHBOARD_MONTH_COUNT + 1),
  );
}

function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) return null;

  return Math.round(((current - previous) / previous) * 1_000) / 10;
}

async function getCustomerEmails(customerIds: string[]) {
  const emails = new Map<string, string | null>();

  if (customerIds.length === 0) return emails;

  try {
    const admin = createAdminClient();
    const results = await Promise.all(
      customerIds.map(async (customerId) => ({
        customerId,
        result: await admin.auth.admin.getUserById(customerId),
      })),
    );

    for (const { customerId, result } of results) {
      emails.set(customerId, result.error ? null : (result.data.user?.email ?? null));
    }
  } catch (error) {
    console.error("Admin dashboard customer email lookup failed:", error);
    for (const customerId of customerIds) emails.set(customerId, null);
  }

  return emails;
}

export async function getAdminDashboardData(
  supabase: AdminSupabaseClient,
): Promise<AdminDashboardData> {
  const today = getBeirutDateOnly();
  const monthBuckets = getMonthBuckets(today);
  const currentMonth = monthBuckets[DASHBOARD_MONTH_COUNT - 1];
  const nextMonth = getMonthStart(currentMonth, 1);
  const firstChartMonth = monthBuckets[0];
  const firstChartMonthInstant = getBeirutDayStartInstant(firstChartMonth);
  const currentMonthInstant = getBeirutDayStartInstant(currentMonth);
  const nextMonthInstant = getBeirutDayStartInstant(nextMonth);

  const [
    carsResult,
    activeReservationsResult,
    pendingReservationsResult,
    recentCustomersResult,
    newCustomersResult,
    revenueResult,
    reservationsChartResult,
    fleetReservationsResult,
    recentReservationsResult,
  ] = await Promise.all([
    supabase.from("cars").select("id, status, created_at"),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("profiles")
      .select("id, full_name, created_at", { count: "exact" })
      .eq("role", "customer")
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .limit(RECENT_CUSTOMER_LIMIT),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", currentMonthInstant)
      .lt("created_at", nextMonthInstant),
    // With no payment ledger, only completed reservations are treated as earned revenue.
    supabase
      .from("reservations")
      .select("return_date, total_price")
      .eq("status", "completed")
      .gte("return_date", firstChartMonth)
      .lt("return_date", nextMonth),
    supabase
      .from("reservations")
      .select("status, created_at")
      .in("status", ["completed", "pending", "cancelled"])
      .gte("created_at", firstChartMonthInstant)
      .lt("created_at", nextMonthInstant),
    supabase
      .from("reservations")
      .select("car_id, status")
      .in("status", ["pending", "confirmed", "active"])
      .lte("pickup_date", today)
      .gt("return_date", today),
    supabase
      .from("reservations")
      .select(`
        id,
        pickup_date,
        return_date,
        total_price,
        status,
        created_at,
        profiles!reservations_customer_id_fkey (full_name),
        cars!reservations_car_id_fkey (brand, model, year)
      `)
      .order("created_at", { ascending: false })
      .order("id", { ascending: true })
      .limit(RECENT_RESERVATION_LIMIT),
  ]);

  const queryError =
    carsResult.error ??
    activeReservationsResult.error ??
    pendingReservationsResult.error ??
    recentCustomersResult.error ??
    newCustomersResult.error ??
    revenueResult.error ??
    reservationsChartResult.error ??
    fleetReservationsResult.error ??
    recentReservationsResult.error;

  if (queryError) throw queryError;

  const recentCustomerIds = (recentCustomersResult.data ?? []).map(
    (customer) => customer.id,
  );
  const [customerReservationsResult, customerEmails] = await Promise.all([
    recentCustomerIds.length > 0
      ? supabase
          .from("reservations")
          .select("customer_id")
          .in("customer_id", recentCustomerIds)
      : Promise.resolve({ data: [], error: null }),
    getCustomerEmails(recentCustomerIds),
  ]);

  if (customerReservationsResult.error) throw customerReservationsResult.error;

  const customerReservationCounts = new Map<string, number>();
  for (const reservation of customerReservationsResult.data ?? []) {
    customerReservationCounts.set(
      reservation.customer_id,
      (customerReservationCounts.get(reservation.customer_id) ?? 0) + 1,
    );
  }

  const revenueByMonth = new Map(monthBuckets.map((month) => [month, 0]));
  for (const reservation of revenueResult.data ?? []) {
    const month = getMonthStart(reservation.return_date);
    if (revenueByMonth.has(month)) {
      revenueByMonth.set(
        month,
        (revenueByMonth.get(month) ?? 0) + Number(reservation.total_price ?? 0),
      );
    }
  }
  const revenue: RevenueChartItem[] = monthBuckets.map((month) => ({
    month,
    revenue: revenueByMonth.get(month) ?? 0,
  }));

  const reservationsByMonth = new Map<string, ReservationsChartItem>(
    monthBuckets.map((month) => [
      month,
      { month, completed: 0, cancelled: 0, pending: 0 },
    ]),
  );
  for (const reservation of reservationsChartResult.data ?? []) {
    const month = `${getBeirutYearMonth(reservation.created_at)}-01`;
    const bucket = reservationsByMonth.get(month);
    if (
      bucket &&
      (reservation.status === "completed" ||
        reservation.status === "pending" ||
        reservation.status === "cancelled")
    ) {
      bucket[reservation.status] += 1;
    }
  }

  const occupancy = new Map<string, "reserved" | "active">();
  for (const reservation of fleetReservationsResult.data ?? []) {
    const nextStatus = reservation.status === "active" ? "active" : "reserved";
    if (nextStatus === "active" || !occupancy.has(reservation.car_id)) {
      occupancy.set(reservation.car_id, nextStatus);
    }
  }

  const fleetCounts = new Map<FleetStatus, number>(
    DASHBOARD_FLEET_STATUSES.map((status) => [status, 0]),
  );
  for (const car of carsResult.data ?? []) {
    const status: FleetStatus =
      car.status === "maintenance" || car.status === "inactive"
        ? car.status
        : (occupancy.get(car.id) ?? "available");
    fleetCounts.set(status, (fleetCounts.get(status) ?? 0) + 1);
  }

  const currentRevenue = revenue.at(-1)?.revenue ?? 0;
  const previousRevenue = revenue.at(-2)?.revenue ?? 0;

  return {
    kpis: {
      totalCars: carsResult.data?.length ?? 0,
      activeReservations: activeReservationsResult.count ?? 0,
      totalCustomers: recentCustomersResult.count ?? 0,
      monthlyRevenue: currentRevenue,
      pendingReservations: pendingReservationsResult.count ?? 0,
      newCustomersThisMonth: newCustomersResult.count ?? 0,
      revenueGrowthPercentage: calculatePercentageChange(
        currentRevenue,
        previousRevenue,
      ),
      carsAddedThisMonth: (carsResult.data ?? []).filter(
        (car) => getBeirutYearMonth(car.created_at) === currentMonth.slice(0, 7),
      ).length,
    },
    revenue,
    reservations: monthBuckets.map(
      (month) =>
        reservationsByMonth.get(month) ?? {
          month,
          completed: 0,
          cancelled: 0,
          pending: 0,
        },
    ),
    fleetStatus: DASHBOARD_FLEET_STATUSES.map((status) => ({
      status,
      count: fleetCounts.get(status) ?? 0,
    })),
    recentReservations: (recentReservationsResult.data ?? []).map(
      (reservation) => ({
        id: reservation.id,
        customerName: reservation.profiles?.full_name || "Unknown customer",
        carName: reservation.cars
          ? `${reservation.cars.brand} ${reservation.cars.model} ${reservation.cars.year}`
          : "Unknown car",
        pickupDate: reservation.pickup_date,
        returnDate: reservation.return_date,
        totalAmount: Number(reservation.total_price ?? 0),
        status: reservation.status,
        createdAt: reservation.created_at,
      }),
    ),
    recentCustomers: (recentCustomersResult.data ?? []).map((customer) => ({
      id: customer.id,
      fullName: customer.full_name,
      email: customerEmails.get(customer.id) ?? null,
      createdAt: customer.created_at,
      totalReservations: customerReservationCounts.get(customer.id) ?? 0,
    })),
  };
}
