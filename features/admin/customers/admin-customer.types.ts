import type { AdminReservationCar } from "@/features/admin/reservations/admin-reservation.types";
import type { Tables } from "@/types/database.types";
import type { ReservationStatus } from "@/types/domain";

type ProfileRow = Tables<"profiles">;
type ReservationRow = Tables<"reservations">;

export const ADMIN_CUSTOMERS_DEFAULTS = {
  sort: "newest",
  page: 1,
  limit: 6,
} as const;

export const ADMIN_CUSTOMERS_PAGE_SIZES = [6, 12, 24] as const;

export type AdminCustomersSort = "newest" | "oldest";

export type AdminCustomersQuery = {
  q?: string;
  sort?: AdminCustomersSort;
  joinedFrom?: string;
  joinedTo?: string;
  page?: number;
  limit?: number;
};

export type NormalizedAdminCustomersQuery = {
  q: string;
  sort: AdminCustomersSort;
  joinedFrom?: string;
  joinedTo?: string;
  page: number;
  limit: number;
};

export function normalizeAdminCustomersQuery(
  query: AdminCustomersQuery = {},
): NormalizedAdminCustomersQuery {
  const page =
    Number.isInteger(query.page) && (query.page ?? 0) > 0
      ? query.page!
      : ADMIN_CUSTOMERS_DEFAULTS.page;
  const limit = ADMIN_CUSTOMERS_PAGE_SIZES.some(
    (size) => size === query.limit,
  )
    ? query.limit!
    : ADMIN_CUSTOMERS_DEFAULTS.limit;

  return {
    q: query.q?.trim().replace(/\s+/g, " ") ?? "",
    sort: query.sort === "oldest" ? "oldest" : ADMIN_CUSTOMERS_DEFAULTS.sort,
    ...(query.joinedFrom ? { joinedFrom: query.joinedFrom } : {}),
    ...(query.joinedTo ? { joinedTo: query.joinedTo } : {}),
    page,
    limit,
  };
}

export type AdminCustomerListItem = {
  id: ProfileRow["id"];
  fullName: ProfileRow["full_name"];
  phone: ProfileRow["phone"];
  createdAt: ProfileRow["created_at"];
  updatedAt: ProfileRow["updated_at"];
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  /** Sum of stored reservation totals for completed reservations only. */
  totalSpent: number;
};

export type AdminCustomersPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminCustomersSummary = {
  totalCustomers: number;
  activeReservations: number;
  upcomingReservations: number;
  newCustomersThisMonth: number;
};

export type AdminCustomersListData = {
  customers: AdminCustomerListItem[];
  pagination: AdminCustomersPagination;
  /** Global operational counts, independent of the active list filters. */
  summary: AdminCustomersSummary;
};

export type AdminCustomerProfile = {
  id: ProfileRow["id"];
  fullName: ProfileRow["full_name"];
  email: string | null;
  phone: ProfileRow["phone"];
  role: "customer";
  createdAt: ProfileRow["created_at"];
  updatedAt: ProfileRow["updated_at"];
};

export type AdminCustomerStatistics = {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  activeReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  rejectedReservations: number;
  /** Sum of stored reservation totals for completed reservations only. */
  totalSpent: number;
};

export type AdminCustomerReservation = {
  id: ReservationRow["id"];
  car: AdminReservationCar;
  pickupDate: ReservationRow["pickup_date"];
  returnDate: ReservationRow["return_date"];
  rentalDays: number;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: ReservationRow["created_at"];
};

export type AdminCustomerDetails = {
  customer: AdminCustomerProfile;
  statistics: AdminCustomerStatistics;
  currentReservations: AdminCustomerReservation[];
  upcomingReservations: AdminCustomerReservation[];
  reservationHistory: AdminCustomerReservation[];
};

export type AdminCustomerApiError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
};

export type AdminCustomerApiResponse<TData> =
  | { success: true; data: TData; message?: string }
  | { success: false; error: AdminCustomerApiError };
