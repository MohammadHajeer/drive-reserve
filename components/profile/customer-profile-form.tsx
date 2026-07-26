"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  editableCustomerProfileSchema,
  type CustomerProfile,
  type EditableCustomerProfile,
} from "@/features/customer/profile/customer-profile.schema";
import { useUpdateCustomerProfile } from "@/features/customer/profile/hooks/use-update-customer-profile";
import { CustomerProfileRequestError } from "@/features/customer/profile/services/customer-profile.service";

export function CustomerProfileForm({
  profile,
}: {
  profile: CustomerProfile;
}) {
  const updateProfile = useUpdateCustomerProfile();
  const form = useForm<EditableCustomerProfile>({
    resolver: zodResolver(editableCustomerProfileSchema),
    defaultValues: {
      fullName: profile.fullName,
      phone: profile.phone,
    },
  });

  useEffect(() => {
    form.reset({ fullName: profile.fullName, phone: profile.phone });
  }, [form, profile.fullName, profile.phone]);

  async function onSubmit(values: EditableCustomerProfile) {
    try {
      const updatedProfile = await updateProfile.mutateAsync(values);
      form.reset({
        fullName: updatedProfile.fullName,
        phone: updatedProfile.phone,
      });
      toast.success("Profile updated successfully.");
    } catch (error) {
      if (error instanceof CustomerProfileRequestError) {
        for (const [field, messages] of Object.entries(
          error.fieldErrors ?? {},
        )) {
          const message = messages?.[0];

          if (message && (field === "fullName" || field === "phone")) {
            form.setError(field, { type: "server", message });
          }
        }
      }

      toast.error("Unable to update your profile. Please try again.");
    }
  }

  const { errors, isDirty } = form.formState;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-5 text-primary" aria-hidden="true" />
          Personal information
        </CardTitle>
        <CardDescription>
          Update the contact information connected to your customer account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.fullName)}>
                <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                <Input
                  id="fullName"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.fullName)}
                  disabled={updateProfile.isPending}
                  {...form.register("fullName")}
                />
                <FieldError errors={[errors.fullName]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input id="email" value={profile.email} disabled readOnly />
                <FieldDescription>
                  Email changes are managed through account authentication.
                </FieldDescription>
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.phone)}>
              <FieldLabel htmlFor="phone">Phone number</FieldLabel>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+961 70 123 456"
                aria-invalid={Boolean(errors.phone)}
                disabled={updateProfile.isPending}
                {...form.register("phone")}
              />
              <FieldDescription>
                Optional. Include a country code when possible.
              </FieldDescription>
              <FieldError errors={[errors.phone]} />
            </Field>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateProfile.isPending || !isDirty}
              >
                {updateProfile.isPending ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <Save aria-hidden="true" />
                )}
                {updateProfile.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

