import { z } from "zod";

import { ADMIN_RESERVATIONS_PAGE_SIZES } from "@/features/admin/reservations/admin-reservation.types";
import { RESERVATION_STATUSES } from "@/types/domain";

const dateOnlySchema = z.iso.date();

export const adminReservationsQuerySchema = z
  .object({
    q: z
      .string()
      .trim()
      .max(100)
      .default(""),
    status: z.enum(RESERVATION_STATUSES).optional(),
    pickupFrom: dateOnlySchema.optional(),
    pickupTo: dateOnlySchema.optional(),
    sort: z
      .enum([
        "newest",
        "oldest",
        "pickup-asc",
        "pickup-desc",
        "total-asc",
        "total-desc",
      ])
      .default("newest"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce
      .number()
      .int()
      .refine(
        (value) => ADMIN_RESERVATIONS_PAGE_SIZES.some((size) => size === value),
        "Choose a supported page size.",
      )
      .default(10),
  })
  .superRefine((value, context) => {
    if (
      value.pickupFrom &&
      value.pickupTo &&
      value.pickupTo < value.pickupFrom
    ) {
      context.addIssue({
        code: "custom",
        path: ["pickupTo"],
        message: "The end date must be on or after the start date.",
      });
    }
  });

export const adminReservationIdSchema = z.uuid("Invalid reservation ID.");

export const updateAdminReservationStatusSchema = z
  .object({
    status: z.enum([
      "confirmed",
      "active",
      "completed",
      "cancelled",
      "rejected",
    ]),
    reason: z.string().trim().max(1000).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (
      (value.status === "rejected" || value.status === "cancelled") &&
      !value.reason
    ) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: `${value.status === "rejected" ? "A rejection" : "A cancellation"} reason is required.`,
      });
    }
  });
