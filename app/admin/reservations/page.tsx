import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminReservationsPage } from "@/components/admin/reservations/admin-reservations-page";
import { ReservationsLoadingSkeleton } from "@/components/admin/reservations/reservations-states";
export const metadata:Metadata={title:"Reservations"};
export default function ReservationsPage(){return <Suspense fallback={<ReservationsLoadingSkeleton/>}><AdminReservationsPage/></Suspense>}
