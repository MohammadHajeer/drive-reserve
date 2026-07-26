export type CustomerStatus = "active" | "suspended";
export type CustomerSort = "newest" | "oldest" | "most-reservations" | "highest-spend";

export type CustomerReservation = {
  id: string;
  reference: string;
  car: string;
  pickupDate: string;
  returnDate: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled" | "rejected";
  totalAmount: number;
};

export type AdminCustomer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "customer";
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  totalSpent: number;
  reservations: CustomerReservation[];
};

export type AdminCustomersQuery = {
  search?: string;
  status?: CustomerStatus;
  sort?: CustomerSort;
  joinedFrom?: string;
  joinedTo?: string;
  page?: number;
  limit?: number;
};

export type CustomerSummary = { total: number; active: number; suspended: number; newThisMonth: number };
export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number };
export type AdminCustomersResponse = { customers: AdminCustomer[]; summary: CustomerSummary; pagination: PaginationMeta };
