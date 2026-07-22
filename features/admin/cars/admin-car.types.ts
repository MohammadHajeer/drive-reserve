import type { Tables } from "@/types/database.types";
import type { FuelType, Transmission } from "@/types/domain";

type CarRow = Tables<"cars">;
type CarImageRow = Tables<"car_images">;

export type AdminCarImage = {
  id: CarImageRow["id"];
  path: CarImageRow["image_url"];
  url: string;
  isPrimary: CarImageRow["is_primary"];
  displayOrder: CarImageRow["display_order"];
};

export type AdminCar = {
  id: CarRow["id"];
  brand: CarRow["brand"];
  model: CarRow["model"];
  year: CarRow["year"];
  plateNumber: CarRow["plate_number"];
  color: CarRow["color"];
  category: CarRow["category"];
  transmission: CarRow["transmission"];
  fuelType: CarRow["fuel_type"];
  seats: CarRow["seats"];
  pricePerDay: CarRow["price_per_day"];
  description: CarRow["description"];
  status: CarRow["status"];
  images: AdminCarImage[];
  createdAt: CarRow["created_at"];
  updatedAt: CarRow["updated_at"];
};

export type AdminCarsSort =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "year-desc"
  | "brand-asc";

export type AdminCarsQuery = {
  search?: string;
  status?: CarRow["status"];
  category?: string;
  transmission?: Transmission;
  sort?: AdminCarsSort;
  page?: number;
  limit?: number;
};

export type AdminCarsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type AdminCarsListData = {
  cars: AdminCar[];
  pagination: AdminCarsPagination;
};

export type CreateAdminCarInput = Pick<
  AdminCar,
  | "brand"
  | "model"
  | "year"
  | "plateNumber"
  | "color"
  | "category"
  | "seats"
  | "pricePerDay"
> & {
  transmission: Transmission;
  fuelType: FuelType;
  description?: string;
  status?: CarRow["status"];
};

export type UpdateAdminCarInput = Partial<
  Omit<CreateAdminCarInput, "description">
> & {
  description?: string | null;
};

export type UpdateAdminCarVariables = {
  carId: string;
  input: UpdateAdminCarInput;
};

export type UploadAdminCarImagesVariables = {
  carId: string;
  images: readonly File[];
};

export type DeleteAdminCarImageVariables = {
  carId: string;
  imageId: CarImageRow["id"];
};

export const ADMIN_CAR_IMAGE_UPLOAD = {
  fieldName: "images",
  maximumFilesPerRequest: 6,
  maximumFileSizeBytes: 5 * 1024 * 1024,
  acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

export type AdminCarApiError = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
};

export type AdminCarApiSuccessResponse<TData> = {
  success: true;
  data: TData;
  message?: string;
};

export type AdminCarApiErrorResponse = {
  success: false;
  error: AdminCarApiError;
};

export type AdminCarApiResponse<TData> =
  | AdminCarApiSuccessResponse<TData>
  | AdminCarApiErrorResponse;

export type AdminCarData = {
  car: AdminCar;
};

export type AdminCarImagesData = {
  images: AdminCarImage[];
};

export type DeletedAdminCarImageData = {
  imageId: CarImageRow["id"];
};
