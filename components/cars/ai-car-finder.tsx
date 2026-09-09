"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CalendarDays,
  Gauge,
  Sparkles,
  Users,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  aiCarFinderSchema,
  getTodayDateString,
  type AiCarFinderFormValues,
} from "@/lib/validations/ai-car-finder";

const passengerOptions = [
  { label: "1 passenger", value: "1" },
  { label: "2 passengers", value: "2" },
  { label: "3 passengers", value: "3" },
  { label: "4 passengers", value: "4" },
  { label: "5 passengers", value: "5" },
  { label: "6 passengers", value: "6" },
  { label: "7+ passengers", value: "7" },
];

const tripTypeOptions = [
  { label: "City driving", value: "city" },
  { label: "Long-distance trip", value: "long-distance" },
  { label: "Family trip", value: "family" },
  { label: "Business trip", value: "business" },
];

const transmissionOptions = [
  { label: "No preference", value: "any" },
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
];

const fuelOptions = [
  { label: "No preference", value: "any" },
  { label: "Petrol", value: "petrol" },
  { label: "Diesel", value: "diesel" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Electric", value: "electric" },
];

const priorityOptions = [
  { label: "Best overall match", value: "overall" },
  { label: "Lowest daily price", value: "price" },
  { label: "Comfort", value: "comfort" },
  { label: "Fuel efficiency", value: "fuel-efficiency" },
  { label: "Newer vehicle", value: "newer" },
];

export function AiCarFinder() {
  const [open, setOpen] = useState(false);
  const today = getTodayDateString();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AiCarFinderFormValues>({
    resolver: zodResolver(aiCarFinderSchema),
    defaultValues: {
      pickupDate: "",
      returnDate: "",
      passengers: "4",
      tripType: "city",
      transmission: "any",
      fuel: "any",
      priority: "overall",
      notes: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  function onSubmit(data: AiCarFinderFormValues) {
    // Step 3 validates and normalizes the form only.
    // The server request and OpenAI integration come next.
    console.log("Validated AI car finder request:", data);
  }

  return (
    <section
      aria-labelledby="ai-car-finder-heading"
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
            <Sparkles className="size-5" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              AI Car Finder
            </p>
            <h2
              id="ai-car-finder-heading"
              className="mt-1 text-lg font-semibold tracking-tight sm:text-xl"
            >
              Not sure which vehicle fits your trip?
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Tell us what you need and get a few recommendations from the
              current DriveReserve fleet.
            </p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="shrink-0" render={<Button />}>
            Find my car
            <ArrowRight className="size-4" aria-hidden="true" />
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                <Sparkles className="size-5" aria-hidden="true" />
              </div>
              <DialogTitle className="text-xl">
                Find the right car for your trip
              </DialogTitle>
              <DialogDescription className="max-w-xl leading-6">
                Share the essentials. We&apos;ll use them to recommend the
                strongest matches from the available fleet.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-6" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Pickup date"
                  htmlFor="ai-pickup-date"
                  icon={<CalendarDays className="size-4" aria-hidden="true" />}
                  error={errors.pickupDate?.message}
                >
                  <Input
                    id="ai-pickup-date"
                    type="date"
                    min={today}
                    className="h-10 bg-background"
                    aria-invalid={Boolean(errors.pickupDate)}
                    aria-describedby={errors.pickupDate ? "ai-pickup-date-error" : undefined}
                    {...register("pickupDate")}
                  />
                </FormField>

                <FormField
                  label="Return date"
                  htmlFor="ai-return-date"
                  icon={<CalendarDays className="size-4" aria-hidden="true" />}
                  error={errors.returnDate?.message}
                >
                  <Input
                    id="ai-return-date"
                    type="date"
                    min={today}
                    className="h-10 bg-background"
                    aria-invalid={Boolean(errors.returnDate)}
                    aria-describedby={errors.returnDate ? "ai-return-date-error" : undefined}
                    {...register("returnDate")}
                  />
                </FormField>

                <FormField
                  label="Passengers"
                  htmlFor="ai-passengers"
                  icon={<Users className="size-4" aria-hidden="true" />}
                  error={errors.passengers?.message}
                >
                  <Controller
                    name="passengers"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        id="ai-passengers"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={passengerOptions}
                        invalid={Boolean(errors.passengers)}
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label="Maximum budget / day"
                  htmlFor="ai-budget"
                  icon={<Gauge className="size-4" aria-hidden="true" />}
                  error={errors.budgetPerDay?.message}
                >
                  <div className="relative">
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                      aria-hidden="true"
                    >
                      $
                    </span>
                    <Input
                      id="ai-budget"
                      type="number"
                      inputMode="decimal"
                      min="1"
                      max="1000"
                      step="1"
                      placeholder="70"
                      className="h-10 bg-background pl-7"
                      aria-invalid={Boolean(errors.budgetPerDay)}
                      aria-describedby={errors.budgetPerDay ? "ai-budget-error" : undefined}
                      {...register("budgetPerDay", { valueAsNumber: true })}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Trip type"
                  htmlFor="ai-trip-type"
                  error={errors.tripType?.message}
                >
                  <Controller
                    name="tripType"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        id="ai-trip-type"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={tripTypeOptions}
                        invalid={Boolean(errors.tripType)}
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label="Transmission"
                  htmlFor="ai-transmission"
                  error={errors.transmission?.message}
                >
                  <Controller
                    name="transmission"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        id="ai-transmission"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={transmissionOptions}
                        invalid={Boolean(errors.transmission)}
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label="Fuel type"
                  htmlFor="ai-fuel"
                  error={errors.fuel?.message}
                >
                  <Controller
                    name="fuel"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        id="ai-fuel"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={fuelOptions}
                        invalid={Boolean(errors.fuel)}
                      />
                    )}
                  />
                </FormField>

                <FormField
                  label="What matters most?"
                  htmlFor="ai-priority"
                  error={errors.priority?.message}
                >
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        id="ai-priority"
                        value={field.value}
                        onValueChange={field.onChange}
                        options={priorityOptions}
                        invalid={Boolean(errors.priority)}
                      />
                    )}
                  />
                </FormField>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-notes">Anything else?</Label>
                <textarea
                  id="ai-notes"
                  rows={3}
                  maxLength={300}
                  placeholder="Optional: I want something comfortable and economical for a long drive."
                  className="flex w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
                  aria-invalid={Boolean(errors.notes)}
                  aria-describedby={errors.notes ? "ai-notes-error" : undefined}
                  {...register("notes")}
                />
                {errors.notes?.message ? (
                  <p id="ai-notes-error" className="text-xs text-destructive">
                    {errors.notes.message}
                  </p>
                ) : (
                  <p className="text-[11px] leading-5 text-muted-foreground">
                    Keep it brief. Only trip-related preferences are needed.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-muted-foreground">
                  Recommendations will only use vehicles from DriveReserve.
                </p>

                <Button type="submit" className="sm:min-w-40" disabled={isSubmitting}>
                  <Sparkles className="size-4" aria-hidden="true" />
                  Find my best cars
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

function FormField({
  label,
  htmlFor,
  icon,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  icon?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  id,
  value,
  onValueChange,
  options,
  invalid = false,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  invalid?: boolean;
}) {
  return (
    <Select<string>
      items={options}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onValueChange(nextValue);
      }}
    >
      <SelectTrigger
        id={id}
        className="h-10 w-full bg-background"
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
