import type { AdminReservation } from "../admin-reservation.types";

const customers = [
  ["Omar Haddad", "omar@example.com", "+961 70 123 456"],
  ["Maya Khoury", "maya@example.com", "+961 71 456 782"],
  ["Karim Nasser", "karim@example.com", "+961 76 931 440"],
  ["Nour Salem", "nour@example.com", "+961 81 220 315"],
  ["Rami Mansour", "rami@example.com", "+961 70 669 102"],
  ["Lina Daher", "lina@example.com", "+961 79 444 206"],
] as const;
const cars = [
  ["BMW", "X5", 2024, "B 452198", "SUV"],
  ["Mercedes-Benz", "C-Class", 2023, "G 881402", "Sedan"],
  ["Toyota", "Land Cruiser", 2024, "D 662014", "SUV"],
  ["Audi", "A6", 2022, "J 208951", "Sedan"],
  ["Tesla", "Model 3", 2024, "E 900312", "Electric"],
  ["Kia", "Sportage", 2023, "R 401250", "SUV"],
] as const;
const statuses = ["pending", "confirmed", "active", "completed", "cancelled", "rejected"] as const;

export let mockAdminReservations: AdminReservation[] = Array.from({ length: 18 }, (_, index) => {
  const customer = customers[index % customers.length];
  const car = cars[index % cars.length];
  const status = statuses[index % statuses.length];
  const rentalDays = 3 + (index % 5);
  const daily = 65 + (index % 6) * 15;
  const pickup = new Date(2026, 6, 20 + index);
  const returnDate = new Date(pickup);
  returnDate.setDate(returnDate.getDate() + rentalDays);
  return {
    id: `reservation-${String(index + 1).padStart(3, "0")}`,
    reference: `RES-${1001 + index}`,
    customer: { id: `customer-${(index % customers.length) + 1}`, fullName: customer[0], email: customer[1], phone: customer[2] },
    car: { id: `car-${(index % cars.length) + 1}`, brand: car[0], model: car[1], year: car[2], plateNumber: car[3], category: car[4], primaryImageUrl: null },
    pickupDate: pickup.toISOString().slice(0, 10),
    returnDate: returnDate.toISOString().slice(0, 10),
    rentalDays,
    pricePerDaySnapshot: daily,
    subtotal: rentalDays * daily,
    totalPrice: rentalDays * daily,
    status,
    cancellationReason: status === "cancelled" ? "Customer travel plans changed." : null,
    rejectionReason: status === "rejected" ? "The selected car is unavailable for these dates." : null,
    createdAt: new Date(2026, 6, 10 + index).toISOString(),
    updatedAt: new Date(2026, 6, 10 + index).toISOString(),
  };
});

export function updateMockReservation(id: string, status: AdminReservation["status"], reason?: string) {
  const index = mockAdminReservations.findIndex((item) => item.id === id);
  if (index < 0) return undefined;
  const current = mockAdminReservations[index];
  const updated: AdminReservation = {
    ...current,
    status,
    rejectionReason: status === "rejected" ? reason ?? null : null,
    updatedAt: new Date().toISOString(),
  };
  mockAdminReservations = mockAdminReservations.map((item) => item.id === id ? updated : item);
  return updated;
}
