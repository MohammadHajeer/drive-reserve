import { z } from "zod";

const phonePattern = /^\+?[0-9][0-9\s().-]{6,28}[0-9]$/;

export const editableCustomerProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(100, "Full name must contain at most 100 characters."),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number must contain at most 30 characters.")
    .refine(
      (value) => value.length === 0 || phonePattern.test(value),
      "Enter a valid phone number.",
    ),
});

export const customerProfileSchema = z.object({
  fullName: z.string().max(100),
  phone: z.string().max(30),
  email: z.email(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
  emailVerified: z.boolean(),
});

export const customerProfileStatsSchema = z.object({
  totalRentals: z.number().int().nonnegative(),
  activeRentals: z.number().int().nonnegative(),
  completedRentals: z.number().int().nonnegative(),
});

export type EditableCustomerProfile = z.infer<
  typeof editableCustomerProfileSchema
>;
export type CustomerProfile = z.infer<typeof customerProfileSchema>;
export type CustomerProfileStats = z.infer<typeof customerProfileStatsSchema>;
