import { z } from "zod";

const INTERNAL_REDIRECT_BASE_URL = "https://drive-reserve.internal";

export const internalRedirectPathSchema = z.string().refine((value) => {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(value)
  ) {
    return false;
  }

  try {
    const redirectUrl = new URL(value, INTERNAL_REDIRECT_BASE_URL);

    return redirectUrl.origin === INTERNAL_REDIRECT_BASE_URL;
  } catch {
    return false;
  }
}, "Enter a valid internal redirect path");

export function getSafeInternalRedirectPath(value: unknown) {
  const parsed = internalRedirectPathSchema.safeParse(value);

  return parsed.success ? parsed.data : undefined;
}

const phoneSchema = z
  .union([
    z
      .string()
      .trim()
      .max(20, "Phone number is too long")
      .refine(
        (value) => value === "" || /^\+?[0-9\s()-]{7,20}$/.test(value),
        "Enter a valid phone number",
      ),
    z.null(),
  ])
  .optional();

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .transform((email) => email.toLowerCase());

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters")
      .max(100, "Full name is too long"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address")
      .transform((email) => email.toLowerCase()),

    phone: phoneSchema,

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(72, "Password must not exceed 72 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const registrationRequestSchema = registerSchema.safeExtend({
  redirectTo: internalRedirectPathSchema.optional(),
});

export const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters")
      .max(100, "Full name is too long")
      .optional(),

    phone: phoneSchema,
  })
  .strict()
  .refine((data) => data.fullName !== undefined || data.phone !== undefined, {
    message: "Provide at least one field to update",
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(72, "Password must not exceed 72 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
