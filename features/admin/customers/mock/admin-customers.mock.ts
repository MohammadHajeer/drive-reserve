import type { AdminCustomer } from "../admin-customer.types";

const reservations = (prefix: string, name: string): AdminCustomer["reservations"] => {
  const base = Number(prefix.replace("c", "")) || 1;
  return [
  { id: `reservation-${String(base).padStart(3, "0")}`, reference: `DR-${prefix.toUpperCase()}-1042`, car: "BMW X5 2024", pickupDate: "2026-07-12", returnDate: "2026-07-16", status: "completed", totalAmount: 720 },
  { id: `reservation-${String(base + 6).padStart(3, "0")}`, reference: `DR-${prefix.toUpperCase()}-1168`, car: "Mercedes C-Class", pickupDate: "2026-08-04", returnDate: "2026-08-08", status: name.includes("Nour") ? "pending" : "active", totalAmount: 540 },
];
};

export const adminCustomersMock: AdminCustomer[] = [
  ["c1","Youssef Issa","youssef.issa@example.com","+961 70 123 456","active","2026-01-12",1260],
  ["c2","Nour Haddad","nour.haddad@example.com","+961 71 442 901","active","2026-07-05",890],
  ["c3","Omar Khoury","omar.khoury@example.com","+961 76 900 214","suspended","2025-11-19",430],
  ["c4","Maya Saad","maya.saad@example.com","+961 81 332 700","active","2026-06-21",1760],
  ["c5","Karim Nassar","karim.nassar@example.com","+961 70 889 234","active","2026-03-14",615],
  ["c6","Lara Mansour","lara.mansour@example.com","+961 71 221 889","suspended","2025-12-02",245],
  ["c7","Rami Daher","rami.daher@example.com","+961 76 554 018","active","2026-07-18",980],
  ["c8","Sara Fares","sara.fares@example.com","+961 81 903 117","active","2026-02-27",1515],
  ["c9","Jad Salameh","jad.salameh@example.com","+961 70 431 722","active","2026-05-09",320],
].map(([id,fullName,email,phone,status,createdAt,totalSpent], index) => {
  const history = reservations(String(id), String(fullName));
  return {
    id: String(id), fullName: String(fullName), email: String(email), phone: String(phone), role: "customer" as const,
    status: status as AdminCustomer["status"], createdAt: String(createdAt), updatedAt: "2026-07-24",
    totalReservations: 2 + (index % 5), activeReservations: status === "active" && index % 3 === 0 ? 1 : 0,
    completedReservations: 1 + (index % 4), cancelledReservations: index % 2, totalSpent: Number(totalSpent), reservations: history,
  };
});
