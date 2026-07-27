import type { AdminDashboardData } from "../admin-dashboard.types";

export const adminDashboardMock: AdminDashboardData = {
  kpis: {
    totalCars: 48,
    activeReservations: 19,
    totalCustomers: 326,
    monthlyRevenue: 28450,
    pendingReservations: 6,
    newCustomersThisMonth: 24,
    revenueGrowthPercentage: 12.4,
    carsAddedThisMonth: 4,
  },

  revenue: [
    {
      month: "Jan",
      revenue: 14800,
    },
    {
      month: "Feb",
      revenue: 17600,
    },
    {
      month: "Mar",
      revenue: 16950,
    },
    {
      month: "Apr",
      revenue: 21200,
    },
    {
      month: "May",
      revenue: 24100,
    },
    {
      month: "Jun",
      revenue: 28450,
    },
  ],

  reservations: [
    {
      month: "Jan",
      completed: 28,
      cancelled: 4,
      pending: 6,
    },
    {
      month: "Feb",
      completed: 33,
      cancelled: 3,
      pending: 7,
    },
    {
      month: "Mar",
      completed: 31,
      cancelled: 5,
      pending: 8,
    },
    {
      month: "Apr",
      completed: 39,
      cancelled: 4,
      pending: 7,
    },
    {
      month: "May",
      completed: 44,
      cancelled: 6,
      pending: 9,
    },
    {
      month: "Jun",
      completed: 51,
      cancelled: 5,
      pending: 6,
    },
  ],

  fleetStatus: [
    {
      status: "available",
      count: 22,
      fill: "var(--color-available)",
    },
    {
      status: "reserved",
      count: 15,
      fill: "var(--color-reserved)",
    },
    {
      status: "maintenance",
      count: 7,
      fill: "var(--color-maintenance)",
    },
    {
      status: "inactive",
      count: 4,
      fill: "var(--color-inactive)",
    },
  ],

  recentReservations: [
    {
      id: "reservation-001",
      reference: "DRV-1048",
      customerName: "Omar Haddad",
      carName: "Toyota Camry 2024",
      pickupDate: "2026-07-27",
      returnDate: "2026-07-31",
      totalAmount: 420,
      status: "approved",
    },
    {
      id: "reservation-002",
      reference: "DRV-1047",
      customerName: "Maya Khoury",
      carName: "BMW X5 2023",
      pickupDate: "2026-07-28",
      returnDate: "2026-08-02",
      totalAmount: 975,
      status: "pending",
    },
    {
      id: "reservation-003",
      reference: "DRV-1046",
      customerName: "Karim Nassar",
      carName: "Hyundai Tucson 2024",
      pickupDate: "2026-07-25",
      returnDate: "2026-07-29",
      totalAmount: 360,
      status: "completed",
    },
    {
      id: "reservation-004",
      reference: "DRV-1045",
      customerName: "Lina Saad",
      carName: "Mercedes-Benz C-Class",
      pickupDate: "2026-07-29",
      returnDate: "2026-08-03",
      totalAmount: 840,
      status: "pending",
    },
    {
      id: "reservation-005",
      reference: "DRV-1044",
      customerName: "Rami Daher",
      carName: "Kia Sportage 2023",
      pickupDate: "2026-07-22",
      returnDate: "2026-07-26",
      totalAmount: 315,
      status: "cancelled",
    },
  ],

  recentCustomers: [
    {
      id: "customer-001",
      fullName: "Nour Mansour",
      email: "nour.mansour@example.com",
      createdAt: "2026-07-27T10:30:00.000Z",
      totalReservations: 1,
    },
    {
      id: "customer-002",
      fullName: "Jad Farah",
      email: "jad.farah@example.com",
      createdAt: "2026-07-26T14:10:00.000Z",
      totalReservations: 2,
    },
    {
      id: "customer-003",
      fullName: "Sara Ibrahim",
      email: "sara.ibrahim@example.com",
      createdAt: "2026-07-25T09:45:00.000Z",
      totalReservations: 1,
    },
    {
      id: "customer-004",
      fullName: "Ali Hamdan",
      email: "ali.hamdan@example.com",
      createdAt: "2026-07-24T16:20:00.000Z",
      totalReservations: 3,
    },
  ],
};