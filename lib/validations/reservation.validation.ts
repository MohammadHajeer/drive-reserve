import { z } from "zod";

import {
  addDaysToDateOnly,
  dateDifferenceInDays,
  getBeirutDateOnly,
  isValidDateOnly,
} from "@/lib/reservations/reservation-date";

export const MAX_RENTAL_DAYS = 30;
export const MAX_BOOKING_HORIZON_DAYS = 180;

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format.")
  .refine(isValidDateOnly, "Enter a valid date.");

export const reservationPreviewSchema = z
  .object({
    carId: z.uuid("Invalid car ID."),
    pickupDate: dateOnlySchema,
    returnDate: dateOnlySchema,
  })
  .superRefine((values, context) => {
    const today = getBeirutDateOnly();
    const earliestPickupDate = addDaysToDateOnly(today, 1);

    if (values.pickupDate < earliestPickupDate) {
      context.addIssue({
        code: "custom",
        path: ["pickupDate"],
        message: "Pickup date must be after today.",
      });
    }

    if (values.returnDate <= values.pickupDate) {
      context.addIssue({
        code: "custom",
        path: ["returnDate"],
        message: "Return date must be after the pickup date.",
      });

      return;
    }

    if (
      dateDifferenceInDays(values.pickupDate, values.returnDate) >
      MAX_RENTAL_DAYS
    ) {
      context.addIssue({
        code: "custom",
        path: ["returnDate"],
        message: `A reservation cannot exceed ${MAX_RENTAL_DAYS} rental days.`,
      });
    }

    if (
      dateDifferenceInDays(today, values.pickupDate) >
      MAX_BOOKING_HORIZON_DAYS
    ) {
      context.addIssue({
        code: "custom",
        path: ["pickupDate"],
        message: `Reservations cannot be created more than ${MAX_BOOKING_HORIZON_DAYS} days in advance.`,
      });
    }
  });

export type ReservationPreviewInput = z.infer<typeof reservationPreviewSchema>;

export const carUnavailableRangesSchema = z
  .object({
    carId: z.string().uuid("Invalid car ID."),
    from: dateOnlySchema,
    to: dateOnlySchema,
  })
  .superRefine((values, context) => {
    if (values.to < values.from) {
      context.addIssue({
        code: "custom",
        path: ["to"],
        message: "The end date must be on or after the start date.",
      });

      return;
    }

    if (dateDifferenceInDays(values.from, values.to) > 92) {
      context.addIssue({
        code: "custom",
        path: ["to"],
        message: "The requested calendar range cannot exceed 93 days.",
      });
    }
  });

export type CarUnavailableRangesInput = z.infer<
  typeof carUnavailableRangesSchema
>;
