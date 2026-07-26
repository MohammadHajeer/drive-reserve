import type { Tables } from "@/types/database.types";
import type { ReservationStatus } from "@/types/domain";

type ReservationRow = Tables<"reservations">;
type ProfileRow = Tables<"profiles">;
type CarRow = Tables<"cars">;

export type AdminReservationCustomer = {
  id: ProfileRow["id"];
  fullName: ProfileRow["full_name"];
  email: string;
  phone: ProfileRow["phone"];
};

export type AdminReservationCar = {
  id: CarRow["id"];
  brand: CarRow["brand"];
  model: CarRow["model"];
  year: CarRow["year"];
  plateNumber: CarRow["plate_number"];
  category: CarRow["category"];
  primaryImageUrl: string | null;
};

export type AdminReservation = {
  id: ReservationRow["id"];
  reference: string;
  customer: AdminReservationCustomer;
  car: AdminReservationCar;
  pickupDate: ReservationRow["pickup_date"];
  returnDate: ReservationRow["return_date"];
  rentalDays: number;
  pricePerDaySnapshot: ReservationRow["price_per_day_snapshot"];
  subtotal: number;
  totalPrice: number;
  status: ReservationStatus;
  cancellationReason: ReservationRow["cancellation_reason"];
  rejectionReason: ReservationRow["rejection_reason"];
  createdAt: ReservationRow["created_at"];
  updatedAt: ReservationRow["updated_at"];
};

export type AdminReservationsQuery = {
  search?: string;
  status?: ReservationStatus;
  customerId?: string;
  carId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

export type AdminReservationsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminReservationsSummary = Record<"all" | ReservationStatus, number>;

export type AdminReservationsListData = {
  reservations: AdminReservation[];
  pagination: AdminReservationsPagination;
  summary: AdminReservationsSummary;
};

export type UpdateAdminReservationStatusVariables = {
  reservationId: string;
  status: ReservationStatus;
  reason?: string;
};
