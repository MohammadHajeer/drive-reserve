import { z } from "zod";

import { ADMIN_CUSTOMERS_PAGE_SIZES } from "@/features/admin/customers/admin-customer.types";

export const adminCustomersQuerySchema = z
  .object({
    q: z
      .string()
      .trim()
      .max(100)
      .transform((value) => value.replace(/\s+/g, " ") || undefined),
    sort: z.enum(["newest", "oldest"]).default("newest"),
    joinedFrom: z.iso.date().optional(),
    joinedTo: z.iso.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce
      .number()
      .int()
      .refine(
        (value) => ADMIN_CUSTOMERS_PAGE_SIZES.some((size) => size === value),
        "Choose a supported page size.",
      )
      .default(6),
  })
  .superRefine((value, context) => {
    if (
      value.joinedFrom &&
      value.joinedTo &&
      value.joinedTo < value.joinedFrom
    ) {
      context.addIssue({
        code: "custom",
        path: ["joinedTo"],
        message: "The end date must be on or after the start date.",
      });
    }
  });

export const adminCustomerIdSchema = z.uuid("Invalid customer ID.");
