import { z } from "zod";

import { RESERVATION_STATUSES } from "@/types/domain";

export const DASHBOARD_FLEET_STATUSES = [
  "available",
  "reserved",
  "active",
  "maintenance",
  "inactive",
] as const;

export const dashboardKpiSchema = z.object({
  totalCars: z.number().int().nonnegative(),
  activeReservations: z.number().int().nonnegative(),
  totalCustomers: z.number().int().nonnegative(),
  monthlyRevenue: z.number().nonnegative(),
  pendingReservations: z.number().int().nonnegative(),
  newCustomersThisMonth: z.number().int().nonnegative(),
  revenueGrowthPercentage: z.number().nullable(),
  carsAddedThisMonth: z.number().int().nonnegative(),
});

export const revenueChartItemSchema = z.object({
  month: z.iso.date(),
  revenue: z.number().nonnegative(),
});

export const reservationsChartItemSchema = z.object({
  month: z.iso.date(),
  completed: z.number().int().nonnegative(),
  cancelled: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
});

export const fleetStatusChartItemSchema = z.object({
  status: z.enum(DASHBOARD_FLEET_STATUSES),
  count: z.number().int().nonnegative(),
});

export const recentDashboardReservationSchema = z.object({
  id: z.uuid(),
  customerName: z.string(),
  carName: z.string(),
  pickupDate: z.iso.date(),
  returnDate: z.iso.date(),
  totalAmount: z.number().nonnegative(),
  status: z.enum(RESERVATION_STATUSES),
  createdAt: z.iso.datetime({ offset: true }),
});

export const recentDashboardCustomerSchema = z.object({
  id: z.uuid(),
  fullName: z.string(),
  email: z.email().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  totalReservations: z.number().int().nonnegative(),
});

export const adminDashboardDataSchema = z.object({
  kpis: dashboardKpiSchema,
  revenue: z.array(revenueChartItemSchema),
  reservations: z.array(reservationsChartItemSchema),
  fleetStatus: z.array(fleetStatusChartItemSchema),
  recentReservations: z.array(recentDashboardReservationSchema),
  recentCustomers: z.array(recentDashboardCustomerSchema),
});

export type DashboardKpi = z.infer<typeof dashboardKpiSchema>;
export type RevenueChartItem = z.infer<typeof revenueChartItemSchema>;
export type ReservationsChartItem = z.infer<
  typeof reservationsChartItemSchema
>;
export type FleetStatus = (typeof DASHBOARD_FLEET_STATUSES)[number];
export type FleetStatusChartItem = z.infer<
  typeof fleetStatusChartItemSchema
>;
export type RecentDashboardReservation = z.infer<
  typeof recentDashboardReservationSchema
>;
export type RecentDashboardCustomer = z.infer<
  typeof recentDashboardCustomerSchema
>;
export type AdminDashboardData = z.infer<typeof adminDashboardDataSchema>;

export type AdminDashboardApiError = {
  code: string;
  message: string;
};

export type AdminDashboardApiResponse =
  | { success: true; data: AdminDashboardData }
  | { success: false; error: AdminDashboardApiError };
