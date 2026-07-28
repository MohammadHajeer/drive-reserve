import type { Metadata } from "next";
import { AdminReservationDetailsPage } from "@/components/admin/reservations/admin-reservation-details-page";
export const metadata:Metadata={title:"Reservation details"};
export default async function ReservationDetailsPage({params}:{params:Promise<{reservationId:string}>}){const {reservationId}=await params;return <AdminReservationDetailsPage reservationId={reservationId}/>}
