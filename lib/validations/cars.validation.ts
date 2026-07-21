import { z } from "zod";
import { CAR_STATUSES, FUEL_TYPES, TRANSMISSIONS } from "@/types/domain";

export const createCarSchema = z.object({
  brand: z.string().trim().min(2).max(50),
  model: z.string().trim().min(1).max(50),

  year: z.coerce.number().int().min(1900).max(2100),

  plateNumber: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .transform((value) => value.toUpperCase()),

  color: z.string().trim().min(2).max(30),
  category: z.string().trim().min(2).max(50),

  transmission: z.enum(TRANSMISSIONS),
  fuelType: z.enum(FUEL_TYPES),

  seats: z.coerce.number().int().min(1).max(20),

  pricePerDay: z.coerce.number().positive().max(99999999.99),

  description: z.string().trim().max(3000).optional().or(z.literal("")),

  status: z.enum(CAR_STATUSES).default("available"),
});

export const adminCarsQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(80)
    .regex(/^[\p{L}\p{N}\s-]*$/u)
    .default(""),

  status: z.enum(CAR_STATUSES).optional(),
  category: z.string().trim().max(50).optional(),
  transmission: z.enum(TRANSMISSIONS).optional(),

  sort: z
    .enum([
      "newest",
      "oldest",
      "price-asc",
      "price-desc",
      "year-desc",
      "brand-asc",
    ])
    .default("newest"),

  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const updateCarSchema = z
  .object({
    brand: z.string().trim().min(2).max(50).optional(),

    model: z.string().trim().min(1).max(50).optional(),

    year: z.coerce.number().int().min(1900).max(2100).optional(),

    plateNumber: z
      .string()
      .trim()
      .min(2)
      .max(30)
      .transform((value) => value.toUpperCase())
      .optional(),

    color: z.string().trim().min(2).max(30).optional(),

    category: z.string().trim().min(2).max(50).optional(),

    transmission: z.enum(TRANSMISSIONS).optional(),

    fuelType: z.enum(FUEL_TYPES).optional(),

    seats: z.coerce.number().int().min(1).max(20).optional(),

    pricePerDay: z.coerce.number().positive().max(99999999.99).optional(),

    description: z.union([z.string().trim().max(3000), z.null()]).optional(),

    status: z.enum(CAR_STATUSES).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });
