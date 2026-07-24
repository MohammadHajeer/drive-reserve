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
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format.")
  .refine(isValidDateOnly, "Enter a valid date.");

function dateDifferenceInDays(from: string, to: string) {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);

  return (
    (Date.UTC(toYear, toMonth - 1, toDay) -
      Date.UTC(fromYear, fromMonth - 1, fromDay)) /
    86_400_000
  );
}

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
