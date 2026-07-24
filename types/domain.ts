import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "./database.types";
import { Constants } from "./database.types";

/**
 * Database enum values
 *
 * These come directly from the Supabase-generated database types.
 */
export const APP_ROLES = Constants.public.Enums.app_role;
export type AppRole = Database["public"]["Enums"]["app_role"];

export const CAR_STATUSES = Constants.public.Enums.car_status;
export type CarStatus = Database["public"]["Enums"]["car_status"];

export const RESERVATION_STATUSES = Constants.public.Enums.reservation_status;
export type ReservationStatus =
  Database["public"]["Enums"]["reservation_status"];

/**
 * Application-level values
 *
 * transmission and fuel_type are currently typed as plain strings in the
 * generated Supabase file, so their supported values are declared here.
 */
export const TRANSMISSIONS = ["automatic", "manual"] as const;
export type Transmission = (typeof TRANSMISSIONS)[number];

export const FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric"] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

/**
 * Table row types
 */
export type Profile = Tables<"profiles">;
export type Car = Tables<"cars">;
export type CarImage = Tables<"car_images">;
export type Reservation = Tables<"reservations">;

/**
 * Table insert types
 */
export type ProfileInsert = TablesInsert<"profiles">;
export type CarInsert = TablesInsert<"cars">;
export type CarImageInsert = TablesInsert<"car_images">;
export type ReservationInsert = TablesInsert<"reservations">;

/**
 * Table update types
 */
export type ProfileUpdate = TablesUpdate<"profiles">;
export type CarUpdate = TablesUpdate<"cars">;
export type CarImageUpdate = TablesUpdate<"car_images">;
export type ReservationUpdate = TablesUpdate<"reservations">;

/**
 * Common joined types
 */
export type CarWithImages = Car & {
  car_images: CarImage[];
};

export type CarWithPrimaryImage = Car & {
  primaryImageUrl: string | null;
};

/**
 * Useful public/admin car shapes
 */
export type PublicCar = Pick<
  Car,
  | "id"
  | "brand"
  | "model"
  | "year"
  | "color"
  | "category"
  | "transmission"
  | "fuel_type"
  | "seats"
  | "price_per_day"
  | "description"
  | "features"
  | "status"
>;

export type AdminCar = Car & {
  car_images: CarImage[];
};
