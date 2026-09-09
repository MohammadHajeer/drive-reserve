import { z } from "zod";

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export const aiCarFinderSchema = z
  .object({
    pickupDate: z.string().min(1, "Pickup date is required."),
    returnDate: z.string().min(1, "Return date is required."),
    passengers: z.enum(["1", "2", "3", "4", "5", "6", "7"]),
    budgetPerDay: z
      .number({ error: "Enter a valid daily budget." })
      .min(1, "Budget must be at least $1.")
      .max(1000, "Budget must be $1,000 or less."),
    tripType: z.enum(["city", "long-distance", "family", "business"]),
    transmission: z.enum(["any", "automatic", "manual"]),
    fuel: z.enum(["any", "petrol", "diesel", "hybrid", "electric"]),
    priority: z.enum([
      "overall",
      "price",
      "comfort",
      "fuel-efficiency",
      "newer",
    ]),
    notes: z
      .string()
      .trim()
      .max(300, "Notes must be 300 characters or less.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    const today = getTodayDateString();

    if (data.pickupDate && data.pickupDate < today) {
      ctx.addIssue({
        code: "custom",
        path: ["pickupDate"],
        message: "Pickup date cannot be in the past.",
      });
    }

    if (data.returnDate && data.returnDate < today) {
      ctx.addIssue({
        code: "custom",
        path: ["returnDate"],
        message: "Return date cannot be in the past.",
      });
    }

    if (data.pickupDate && data.returnDate && data.returnDate <= data.pickupDate) {
      ctx.addIssue({
        code: "custom",
        path: ["returnDate"],
        message: "Return date must be after the pickup date.",
      });
    }
  });

export type AiCarFinderFormValues = z.infer<typeof aiCarFinderSchema>;
