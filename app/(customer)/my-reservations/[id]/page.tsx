import { CustomerReservationDetailsPage } from "@/components/reservation/customer-reservation-details-page";

type ReservationDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReservationDetailsPage({
  params,
}: ReservationDetailsPageProps) {
  const { id } = await params;

  return <CustomerReservationDetailsPage reservationId={id} />;
}
