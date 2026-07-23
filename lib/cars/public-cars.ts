import type { Car } from "@/types/domain";

export const PUBLIC_CAR_CATEGORIES = [
  "economy",
  "compact",
  "sedan",
  "suv",
  "luxury",
  "electric",
] as const;

export const PUBLIC_CAR_TRANSMISSIONS = ["automatic", "manual"] as const;

export const PUBLIC_CAR_FUEL_TYPES = [
  "petrol",
  "diesel",
  "hybrid",
  "electric",
] as const;

export const PUBLIC_CAR_SEAT_GROUPS = ["2-4", "5", "7+"] as const;

export const PUBLIC_CAR_SORT_OPTIONS = [
  "price-asc",
  "price-desc",
  "newest",
  "year-desc",
  "brand-asc",
] as const;

export const PUBLIC_CAR_VIEWS = ["grid", "list"] as const;

export type PublicCarCategory = (typeof PUBLIC_CAR_CATEGORIES)[number];
export type PublicCarTransmission = (typeof PUBLIC_CAR_TRANSMISSIONS)[number];
export type PublicCarFuelType = (typeof PUBLIC_CAR_FUEL_TYPES)[number];
export type PublicCarSeatGroup = (typeof PUBLIC_CAR_SEAT_GROUPS)[number];
export type PublicCarSort = (typeof PUBLIC_CAR_SORT_OPTIONS)[number];
export type PublicCarView = (typeof PUBLIC_CAR_VIEWS)[number];

export type PublicCarsSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type PublicCarsFilters = {
  q: string;
  categories: PublicCarCategory[];
  transmissions: PublicCarTransmission[];
  fuels: PublicCarFuelType[];
  seatGroups: PublicCarSeatGroup[];
  maxPrice?: number;
  sort: PublicCarSort;
  page: number;
  view: PublicCarView;
};

export const DEFAULT_PUBLIC_CARS_FILTERS: PublicCarsFilters = {
  q: "",
  categories: [],
  transmissions: [],
  fuels: [],
  seatGroups: [],
  sort: "price-asc",
  page: 1,
  view: "grid",
};

export type PublicCarListItem = {
  id: Car["id"];
  brand: Car["brand"];
  model: Car["model"];
  year: Car["year"];
  color: Car["color"];
  category: Car["category"];
  transmission: Car["transmission"];
  fuelType: Car["fuel_type"];
  seats: Car["seats"];
  pricePerDay: Car["price_per_day"];
  status: Car["status"];
  primaryImageUrl: string | null;
};

export type PublicCarsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PublicCarsPriceRange = {
  min: number;
  max: number;
  step: number;
};
