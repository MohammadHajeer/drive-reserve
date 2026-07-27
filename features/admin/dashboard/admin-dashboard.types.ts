export type DashboardKpi = {
  totalCars: number;
  activeReservations: number;
  totalCustomers: number;
  monthlyRevenue: number;
  pendingReservations: number;
  newCustomersThisMonth: number;
  revenueGrowthPercentage: number;
  carsAddedThisMonth: number;
};

export type RevenueChartItem = {
  month: string;
  revenue: number;
};

export type ReservationsChartItem = {
  month: string;
  completed: number;
  cancelled: number;
  pending: number;
};

export type FleetStatus =
  | "available"
  | "reserved"
  | "maintenance"
  | "inactive";

export type FleetStatusChartItem = {
  status: FleetStatus;
  count: number;
  fill: string;
};

export type DashboardReservationStatus =
  | "pending"
  | "approved"
  | "completed"
  | "cancelled"
  | "rejected";

export type RecentDashboardReservation = {
  id: string;
  reference: string;
  customerName: string;
  carName: string;
  pickupDate: string;
  returnDate: string;
  totalAmount: number;
  status: DashboardReservationStatus;
};

export type RecentDashboardCustomer = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  totalReservations: number;
};

export type AdminDashboardData = {
  kpis: DashboardKpi;
  revenue: RevenueChartItem[];
  reservations: ReservationsChartItem[];
  fleetStatus: FleetStatusChartItem[];
  recentReservations: RecentDashboardReservation[];
  recentCustomers: RecentDashboardCustomer[];
};