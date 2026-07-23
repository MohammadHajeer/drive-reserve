import type { Metadata } from "next";
import { AdminCarsPage } from "@/components/admin/cars/admin-cars-page";

export const metadata: Metadata = { title: "Car Management" };

export default function CarsPage() {
  return <AdminCarsPage />;
}
