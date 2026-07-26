import { z } from "zod";

import { RESERVATION_STATUSES } from "@/types/domain";

export const customerReservationSchema = z.object({
  id: z.uuid(),
  pickupDate: z.iso.date(),
  returnDate: z.iso.date(),
  rentalDays: z.number().int().positive(),
  totalPrice: z.number().nonnegative(),
  status: z.enum(RESERVATION_STATUSES),
  createdAt: z.iso.datetime({ offset: true }),
  car: z.object({
    id: z.uuid().nullable(),
    name: z.string(),
    category: z.string().nullable(),
    imageUrl: z.url().nullable(),
  }),
});

export const customerReservationsSchema = z.array(customerReservationSchema);

export type CustomerReservation = z.infer<typeof customerReservationSchema>;
