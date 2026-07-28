import type { Tables } from "@/types/database.types";
import type { ReservationStatus } from "@/types/domain";

type ReservationRow = Tables<"reservations">;
type ProfileRow = Tables<"profiles">;
type CarRow = Tables<"cars">;

export const ADMIN_RESERVATIONS_DEFAULTS = {
  sort: "newest",
  page: 1,
  limit: 10,
} as const;

export const ADMIN_RESERVATIONS_PAGE_SIZES = [10, 20, 50] as const;

export type AdminReservationsSort =
  | "newest"
  | "oldest"
  | "pickup-asc"
  | "pickup-desc"
  | "total-asc"
  | "total-desc";

export type AdminReservationCustomer = {
  id: ProfileRow["id"];
  fullName: ProfileRow["full_name"] | null;
  email: string | null;
  phone: ProfileRow["phone"];
};

export type AdminReservationCar = {
  id: CarRow["id"];
  brand: CarRow["brand"] | null;
  model: CarRow["model"] | null;
  year: CarRow["year"] | null;
  plateNumber: CarRow["plate_number"] | null;
  category: CarRow["category"] | null;
  primaryImageUrl: string | null;
};

export type AdminReservation = {
  id: ReservationRow["id"];
  customer: AdminReservationCustomer;
  car: AdminReservationCar;
  pickupDate: ReservationRow["pickup_date"];
  returnDate: ReservationRow["return_date"];
  rentalDays: number;
  pricePerDaySnapshot: number;
  subtotal: number;
  totalPrice: number;
  status: ReservationStatus;
  cancellationReason: ReservationRow["cancellation_reason"];
  rejectionReason: ReservationRow["rejection_reason"];
  createdAt: ReservationRow["created_at"];
  updatedAt: ReservationRow["updated_at"];
};

export type AdminReservationsQuery = {
  q?: string;
  status?: ReservationStatus;
  pickupFrom?: string;
  pickupTo?: string;
  sort?: AdminReservationsSort;
  page?: number;
  limit?: number;
};

export type NormalizedAdminReservationsQuery = {
  q: string;
  status?: ReservationStatus;
  pickupFrom?: string;
  pickupTo?: string;
  sort: AdminReservationsSort;
  page: number;
  limit: number;
};

export function normalizeAdminReservationsQuery(
  query: AdminReservationsQuery = {},
): NormalizedAdminReservationsQuery {
  return {
    q: query.q?.trim().replace(/\s+/g, " ") ?? "",
    ...(query.status ? { status: query.status } : {}),
    ...(query.pickupFrom ? { pickupFrom: query.pickupFrom } : {}),
    ...(query.pickupTo ? { pickupTo: query.pickupTo } : {}),
    sort: query.sort ?? ADMIN_RESERVATIONS_DEFAULTS.sort,
    page: query.page ?? ADMIN_RESERVATIONS_DEFAULTS.page,
    limit: query.limit ?? ADMIN_RESERVATIONS_DEFAULTS.limit,
  };
}

export type AdminReservationsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminReservationsSummary = Record<
  "all" | ReservationStatus,
  number
>;

export type AdminReservationsListData = {
  reservations: AdminReservation[];
  pagination: AdminReservationsPagination;
  /** Global counts across all reservations, independent of list filters. */
  summary: AdminReservationsSummary;
};

export type AdminReservationData = {
  reservation: AdminReservation;
};

export type UpdateAdminReservationStatusVariables = {
  reservationId: string;
  status: Exclude<ReservationStatus, "pending">;
  reason?: string;
};

export const ADMIN_RESERVATION_TRANSITIONS: Record<
  ReservationStatus,
  readonly Exclude<ReservationStatus, "pending">[]
> = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["active", "cancelled"],
  active: ["completed"],
  completed: [],
  cancelled: [],
  rejected: [],
};

export const ADMIN_RESERVATION_TRANSITION_LABELS: Record<
  Exclude<ReservationStatus, "pending">,
  string
> = {
  confirmed: "Confirm",
  active: "Start rental",
  completed: "Complete",
  cancelled: "Cancel",
  rejected: "Reject",
};

export type AdminReservationApiError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
};

export type AdminReservationApiResponse<TData> =
  | { success: true; data: TData; message?: string }
  | { success: false; error: AdminReservationApiError };
