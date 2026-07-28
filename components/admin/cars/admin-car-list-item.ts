import type { AdminCar } from "@/features/admin/cars/admin-car.types";

const updatedDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export type AdminCarListItem = {
  car: AdminCar;
  dailyPriceLabel: string;
  editHref: string;
  imageUrl: string | null;
  mobileMetaLabel: string;
  name: string;
  vehicleMetaLabel: string;
  updatedLabel: string;
};

export function prepareAdminCarListItems(
  cars: readonly AdminCar[],
): AdminCarListItem[] {
  return cars.map((car) => ({
    car,
    dailyPriceLabel: `$${Number(car.pricePerDay).toFixed(2)}`,
    editHref: `/admin/cars/${car.id}/edit`,
    imageUrl:
      car.images.find((image) => image.isPrimary)?.url ??
      car.images[0]?.url ??
      null,
    mobileMetaLabel: `${car.year} · ${car.plateNumber}`,
    name: `${car.brand} ${car.model}`,
    vehicleMetaLabel: `${car.year} · ${car.color}`,
    updatedLabel: updatedDateFormatter.format(new Date(car.updatedAt)),
  }));
}
