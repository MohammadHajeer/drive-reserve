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

export const customerReservationDetailSchema = z.object({
  id: z.uuid(),
  pickupDate: z.iso.date(),
  returnDate: z.iso.date(),
  rentalDays: z.number().int().positive(),
  pricePerDaySnapshot: z.number().positive(),
  subtotal: z.number().nonnegative(),
  totalPrice: z.number().nonnegative(),
  status: z.enum(RESERVATION_STATUSES),
  cancellationReason: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  customer: z.object({
    fullName: z.string().nullable(),
    email: z.email().nullable(),
    phone: z.string().nullable(),
  }),
  car: z.object({
    id: z.uuid(),
    brand: z.string().nullable(),
    model: z.string().nullable(),
    year: z.number().int().nullable(),
    plateNumber: z.string().nullable(),
    color: z.string().nullable(),
    category: z.string().nullable(),
    transmission: z.string().nullable(),
    fuelType: z.string().nullable(),
    seats: z.number().int().nullable(),
    imageUrl: z.url().nullable(),
  }),
});

export const customerReservationIdSchema = z.uuid(
  "The provided reservation ID is invalid.",
);

export const cancelCustomerReservationSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "A cancellation reason is required.")
    .max(1000, "The cancellation reason cannot exceed 1000 characters."),
});

export type CustomerReservation = z.infer<typeof customerReservationSchema>;
export type CustomerReservationDetail = z.infer<
  typeof customerReservationDetailSchema
>;
export type CancelCustomerReservationInput = z.infer<
  typeof cancelCustomerReservationSchema
>;
