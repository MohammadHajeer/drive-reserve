import { mockAdminReservations, updateMockReservation } from "../mock/admin-reservations.mock";
import type { AdminReservation, AdminReservationsListData, AdminReservationsQuery, AdminReservationsSummary, UpdateAdminReservationStatusVariables } from "../admin-reservation.types";

const useMock = true;
const delay = (ms = 300) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function summary(items: AdminReservation[]): AdminReservationsSummary {
  return items.reduce<AdminReservationsSummary>((acc, item) => {
    acc.all += 1;
    acc[item.status] += 1;
    return acc;
  }, { all: 0, pending: 0, confirmed: 0, active: 0, completed: 0, cancelled: 0, rejected: 0 });
}

export async function fetchAdminReservations(query: AdminReservationsQuery = {}, signal?: AbortSignal): Promise<AdminReservationsListData> {
  if (!useMock) {
    const params = new URLSearchParams(Object.entries(query).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]));
    const response = await fetch(`/api/admin/reservations?${params}`, { cache: "no-store", signal });
    if (!response.ok) throw new Error("Unable to load reservations.");
    return response.json();
  }
  await delay();
  const search = query.search?.trim().toLowerCase();
  const filtered = mockAdminReservations.filter((item) => {
    const matchesSearch = !search || [item.reference, item.customer.fullName, item.customer.email, item.car.brand, item.car.model, item.car.plateNumber].some((value) => value.toLowerCase().includes(search));
    return matchesSearch && (!query.status || item.status === query.status) && (!query.customerId || item.customer.id === query.customerId) && (!query.carId || item.car.id === query.carId) && (!query.dateFrom || item.pickupDate >= query.dateFrom) && (!query.dateTo || item.returnDate <= query.dateTo);
  });
  const limit = Math.max(query.limit ?? 10, 1);
  const totalPages = Math.max(Math.ceil(filtered.length / limit), 1);
  const page = Math.min(Math.max(query.page ?? 1, 1), totalPages);
  return {
    reservations: filtered.slice((page - 1) * limit, page * limit),
    summary: summary(mockAdminReservations),
    pagination: { page, limit, total: filtered.length, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
  };
}

export async function fetchAdminReservation(id: string, signal?: AbortSignal): Promise<AdminReservation> {
  if (!useMock) {
    const response = await fetch(`/api/admin/reservations/${encodeURIComponent(id)}`, { cache: "no-store", signal });
    if (!response.ok) throw new Error("Unable to load reservation.");
    return response.json();
  }
  await delay();
  const item = mockAdminReservations.find((reservation) => reservation.id === id);
  if (!item) throw new Error("Reservation not found.");
  return item;
}

export async function updateAdminReservationStatus(variables: UpdateAdminReservationStatusVariables): Promise<AdminReservation> {
  if (!useMock) {
    const response = await fetch(`/api/admin/reservations/${encodeURIComponent(variables.reservationId)}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: variables.status, reason: variables.reason }) });
    if (!response.ok) throw new Error("Unable to update reservation.");
    return response.json();
  }
  await delay(400);
  const updated = updateMockReservation(variables.reservationId, variables.status, variables.reason);
  if (!updated) throw new Error("Reservation not found.");
  return updated;
}
