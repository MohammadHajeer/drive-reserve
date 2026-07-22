import { z } from "zod";

function isValidDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD date format.")
  .refine(isValidDateOnly, "Enter a valid date.");

export const reservationPreviewSchema = z
  .object({
    carId: z.uuid("Invalid car ID."),
    pickupDate: dateOnlySchema,
    returnDate: dateOnlySchema,
  })
  .superRefine((values, context) => {
    if (values.returnDate <= values.pickupDate) {
      context.addIssue({
        code: "custom",
        path: ["returnDate"],
        message: "Return date must be after the pickup date.",
      });
    }
  });

export type ReservationPreviewInput = z.infer<typeof reservationPreviewSchema>;
