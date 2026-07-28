"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FormInputFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: ReactNode;
  icon?: LucideIcon;
  labelAction?: ReactNode;
  description?: ReactNode;
  passwordToggle?: boolean;
} & Omit<
  ComponentProps<typeof Input>,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
>;

export function FormInputField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  icon: Icon,
  labelAction,
  description,
  passwordToggle = false,
  type = "text",
  id,
  className,
  ...inputProps
}: FormInputFieldProps<TFieldValues>) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id ?? name;
  const resolvedType =
    passwordToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-2">
          {labelAction ? (
            <div className="flex items-center justify-between gap-4">
              <FieldLabel
                htmlFor={inputId}
                className="text-sm font-medium text-foreground"
              >
                {label}
              </FieldLabel>
              {labelAction}
            </div>
          ) : (
            <FieldLabel
              htmlFor={inputId}
              className="text-sm font-medium text-foreground"
            >
              {label}
            </FieldLabel>
          )}

          <div className="relative">
            {Icon ? (
              <Icon className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
            ) : null}

            <Input
              {...inputProps}
              {...field}
              id={inputId}
              type={resolvedType}
              value={field.value ?? ""}
              aria-invalid={fieldState.invalid}
              className={cn(
                "h-auto w-full rounded-3xl border-input bg-background py-3 text-sm text-foreground transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/10",
                Icon ? "pl-11" : "px-4",
                passwordToggle && "pr-12",
                className,
              )}
            />

            {passwordToggle ? (
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-3 flex items-center rounded-full p-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            ) : null}
          </div>

          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : null}
        </Field>
      )}
    />
  );
}
