"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  AdminCar,
  AdminCarImage,
} from "@/features/admin/cars/admin-car.types";
import { ADMIN_CAR_IMAGE_UPLOAD } from "@/features/admin/cars/admin-car.types";
import { useCreateCar } from "@/features/admin/cars/hooks/use-create-car";
import { useDeleteCarImage } from "@/features/admin/cars/hooks/use-delete-car-image";
import { useSetPrimaryCarImage } from "@/features/admin/cars/hooks/use-set-primary-car-image";
import { useUpdateCar } from "@/features/admin/cars/hooks/use-update-car";
import { useUploadCarImages } from "@/features/admin/cars/hooks/use-upload-car-images";
import { cn } from "@/lib/utils";
import { createCarSchema } from "@/lib/validations/cars.validation";

type CarFormInput = z.input<typeof createCarSchema>;
type CarFormValues = z.output<typeof createCarSchema>;
type CarFormControl = Control<CarFormInput, unknown, CarFormValues>;

type PendingImage = {
  file: File;
  id: string;
  previewUrl: string;
};

type CarFormProps =
  | {
      mode: "create";
      initialCar?: never;
    }
  | {
      mode: "edit";
      initialCar: AdminCar;
    };

const transmissionOptions = [
  { label: "Automatic", value: "automatic" },
  { label: "Manual", value: "manual" },
] as const;

const fuelOptions = [
  { label: "Petrol", value: "petrol" },
  { label: "Diesel", value: "diesel" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Electric", value: "electric" },
] as const;

const statusOptions = [
  { label: "Available", value: "available" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Inactive", value: "inactive" },
] as const;

function defaultValues(car?: AdminCar): CarFormInput {
  return {
    brand: car?.brand ?? "",
    model: car?.model ?? "",
    year: car?.year ?? new Date().getFullYear(),
    plateNumber: car?.plateNumber ?? "",
    color: car?.color ?? "",
    category: car?.category ?? "",
    transmission: car?.transmission === "manual" ? "manual" : "automatic",
    fuelType:
      car?.fuelType === "diesel" ||
      car?.fuelType === "hybrid" ||
      car?.fuelType === "electric"
        ? car.fuelType
        : "petrol",
    seats: car?.seats ?? 5,
    pricePerDay: car ? Number(car.pricePerDay) : 0,
    description: car?.description ?? "",
    status: car?.status ?? "available",
  };
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function CarForm({ mode, initialCar }: CarFormProps) {
  const router = useRouter();
  const createMutation = useCreateCar();
  const updateMutation = useUpdateCar();
  const uploadMutation = useUploadCarImages();
  const deleteImageMutation = useDeleteCarImage();
  const setPrimaryMutation = useSetPrimaryCarImage();

  const [existingImages, setExistingImages] = useState<AdminCarImage[]>(
    () => initialCar?.images ?? [],
  );
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const pendingImagesRef = useRef(pendingImages);
  const [activeImageId, setActiveImageId] = useState<string>();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [createdCarId, setCreatedCarId] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [imageError, setImageError] = useState<string>();
  const [partialSuccess, setPartialSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<CarFormInput, unknown, CarFormValues>({
    resolver: zodResolver(createCarSchema),
    defaultValues: defaultValues(initialCar),
  });

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(() => {
    return () => {
      for (const image of pendingImagesRef.current) {
        URL.revokeObjectURL(image.previewUrl);
      }
    };
  }, []);

  const fieldMutationPending =
    createMutation.isPending || updateMutation.isPending;
  const imageMutationPending =
    uploadMutation.isPending ||
    deleteImageMutation.isPending ||
    setPrimaryMutation.isPending;
  const anyMutationPending = fieldMutationPending || imageMutationPending;
  const fieldsDisabled = anyMutationPending || Boolean(createdCarId);
  const imagesDisabled = anyMutationPending;
  const imageSelectionFull =
    pendingImages.length >= ADMIN_CAR_IMAGE_UPLOAD.maximumFilesPerRequest;
  const carName = initialCar
    ? `${initialCar.brand} ${initialCar.model}`
    : "this car";

  function clearPendingImages() {
    for (const image of pendingImagesRef.current) {
      URL.revokeObjectURL(image.previewUrl);
    }

    setPendingImages([]);
  }

  function addPendingImages(files: FileList | null) {
    if (!files?.length) return;

    const availableSlots =
      ADMIN_CAR_IMAGE_UPLOAD.maximumFilesPerRequest - pendingImages.length;

    if (availableSlots <= 0) {
      toast.error(
        `Upload no more than ${ADMIN_CAR_IMAGE_UPLOAD.maximumFilesPerRequest} images at once.`,
      );
      return;
    }

    const acceptedFiles: File[] = [];

    for (const file of Array.from(files).slice(0, availableSlots)) {
      const acceptedType = ADMIN_CAR_IMAGE_UPLOAD.acceptedMimeTypes.some(
        (mimeType) => mimeType === file.type,
      );

      if (!acceptedType) {
        toast.error(`${file.name} must be a JPG, PNG, or WebP image.`);
        continue;
      }

      if (file.size > ADMIN_CAR_IMAGE_UPLOAD.maximumFileSizeBytes) {
        toast.error(`${file.name} must be 5 MB or smaller.`);
        continue;
      }

      acceptedFiles.push(file);
    }

    if (files.length > availableSlots) {
      toast.error(
        `Only ${availableSlots} more image${availableSlots === 1 ? "" : "s"} can be selected.`,
      );
    }

    setPendingImages((current) => [
      ...current,
      ...acceptedFiles.map((file) => ({
        file,
        id: crypto.randomUUID(),
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    setImageError(undefined);
  }

  function removePendingImage(imageId: string) {
    setPendingImages((current) => {
      const removedImage = current.find((image) => image.id === imageId);

      if (removedImage) {
        URL.revokeObjectURL(removedImage.previewUrl);
      }

      return current.filter((image) => image.id !== imageId);
    });
  }

  async function uploadPendingImages(carId: string) {
    if (pendingImages.length === 0) return [];

    setUploadProgress(0);
    setImageError(undefined);

    try {
      const uploadedImages = await uploadMutation.mutateAsync({
        carId,
        images: pendingImages.map((image) => image.file),
        onProgress: setUploadProgress,
      });

      setExistingImages((current) => [...current, ...uploadedImages]);
      clearPendingImages();
      return uploadedImages;
    } finally {
      setUploadProgress(null);
    }
  }

  async function submitCar(values: CarFormValues) {
    setFormError(undefined);

    if (mode === "edit") {
      try {
        await updateMutation.mutateAsync({
          carId: initialCar.id,
          input: values,
        });
        reset(values);
        toast.success("Car details updated successfully.");
      } catch (error) {
        const message = errorMessage(error, "Unable to update the car.");
        setFormError(message);
        toast.error(message);
      }

      return;
    }

    let carId = createdCarId;

    try {
      if (!carId) {
        const createdCar = await createMutation.mutateAsync(values);
        carId = createdCar.id;
      }

      if (pendingImages.length > 0) {
        try {
          await uploadPendingImages(carId);
        } catch (error) {
          const message = errorMessage(
            error,
            "The car was created, but its images could not be uploaded.",
          );
          setCreatedCarId(carId);
          setPartialSuccess(true);
          setImageError(message);
          toast.warning("Car created, but image upload needs attention.", {
            description:
              "The car record is safe. Retry the image upload or finish without images.",
          });
          return;
        }
      }

      toast.success(
        createdCarId
          ? "Car images uploaded successfully."
          : "Car created successfully.",
      );
      router.push("/admin/cars");
      router.refresh();
    } catch (error) {
      const message = errorMessage(error, "Unable to create the car.");
      setFormError(message);
      toast.error(message);
    }
  }

  async function uploadImagesForEdit() {
    if (mode !== "edit" || pendingImages.length === 0) return;

    try {
      const uploadedImages = await uploadPendingImages(initialCar.id);
      toast.success(
        `${uploadedImages.length} image${uploadedImages.length === 1 ? "" : "s"} uploaded successfully.`,
      );
    } catch (error) {
      const message = errorMessage(error, "Unable to upload the images.");
      setImageError(message);
      toast.error(message);
    }
  }

  async function deleteExistingImage(image: AdminCarImage) {
    if (mode !== "edit") return;

    const confirmed = window.confirm(
      `Delete this image from ${carName}? This also removes it from storage.`,
    );

    if (!confirmed) return;

    setActiveImageId(image.id);
    setImageError(undefined);

    try {
      await deleteImageMutation.mutateAsync({
        carId: initialCar.id,
        imageId: image.id,
      });

      setExistingImages((current) => {
        const remaining = current.filter((item) => item.id !== image.id);

        if (image.isPrimary && remaining.length > 0) {
          const nextPrimary = [...remaining].sort(
            (first, second) => first.displayOrder - second.displayOrder,
          )[0];

          return remaining.map((item) => ({
            ...item,
            isPrimary: item.id === nextPrimary.id,
          }));
        }

        return remaining;
      });
      toast.success("Car image deleted.");
    } catch (error) {
      const message = errorMessage(error, "Unable to delete the image.");
      setImageError(message);
      toast.error(message);
    } finally {
      setActiveImageId(undefined);
    }
  }

  async function makePrimaryImage(image: AdminCarImage) {
    if (mode !== "edit" || image.isPrimary) return;

    setActiveImageId(image.id);
    setImageError(undefined);

    try {
      await setPrimaryMutation.mutateAsync({
        carId: initialCar.id,
        imageId: image.id,
      });
      setExistingImages((current) =>
        current.map((item) => ({
          ...item,
          isPrimary: item.id === image.id,
        })),
      );
      toast.success("Primary image updated.");
    } catch (error) {
      const message = errorMessage(
        error,
        "Unable to update the primary image.",
      );
      setImageError(message);
      toast.error(message);
    } finally {
      setActiveImageId(undefined);
    }
  }

  const submitLabel = createMutation.isPending
    ? "Creating car..."
    : uploadMutation.isPending && mode === "create"
      ? `Uploading images${uploadProgress === null ? "..." : ` — ${uploadProgress}%`}`
      : updateMutation.isPending
        ? "Saving changes..."
        : createdCarId
          ? "Retry image upload"
          : mode === "edit"
            ? "Save changes"
            : "Create car";

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submitCar)}
      className="space-y-6"
    >
      {partialSuccess ? (
        <div
          role="status"
          className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">The car record was created.</p>
            <p className="mt-1 text-sm text-amber-800">
              Only the image upload failed. Vehicle fields are locked to prevent
              a duplicate record; retry the upload below or finish without
              images.
            </p>
          </div>
        </div>
      ) : null}

      <Card className="rounded-3xl border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold">
            Vehicle information
          </CardTitle>
          <CardDescription>
            Core identity details used by fleet operations and customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <CarInputField
              control={control}
              name="brand"
              label="Brand"
              placeholder="Toyota"
              autoComplete="off"
              disabled={fieldsDisabled}
            />
            <CarInputField
              control={control}
              name="model"
              label="Model"
              placeholder="RAV4"
              autoComplete="off"
              disabled={fieldsDisabled}
            />
            <CarInputField
              control={control}
              name="year"
              label="Year"
              type="number"
              min={1900}
              max={2100}
              disabled={fieldsDisabled}
            />
            <CarInputField
              control={control}
              name="plateNumber"
              label="Plate number"
              placeholder="DRV-2048"
              autoComplete="off"
              disabled={fieldsDisabled}
            />
            <CarInputField
              control={control}
              name="color"
              label="Color"
              placeholder="Midnight blue"
              autoComplete="off"
              disabled={fieldsDisabled}
            />
            <CarInputField
              control={control}
              name="category"
              label="Category"
              placeholder="SUV, Sedan, Compact..."
              autoComplete="off"
              disabled={fieldsDisabled}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold">
            Specifications and pricing
          </CardTitle>
          <CardDescription>
            Rental specifications, daily rate, and operational availability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FieldGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <CarSelectField
              control={control}
              name="transmission"
              label="Transmission"
              options={transmissionOptions}
              disabled={fieldsDisabled}
            />
            <CarSelectField
              control={control}
              name="fuelType"
              label="Fuel type"
              options={fuelOptions}
              disabled={fieldsDisabled}
            />
            <CarInputField
              control={control}
              name="seats"
              label="Seats"
              type="number"
              min={1}
              max={20}
              disabled={fieldsDisabled}
            />
            <CarInputField
              control={control}
              name="pricePerDay"
              label="Price per day"
              type="number"
              min={0.01}
              step="0.01"
              prefix="$"
              disabled={fieldsDisabled}
            />
            <CarSelectField
              control={control}
              name="status"
              label="Status"
              options={statusOptions}
              disabled={fieldsDisabled}
            />
          </FieldGroup>

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-2"
              >
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  rows={5}
                  maxLength={3000}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value ?? ""}
                  disabled={fieldsDisabled}
                  aria-invalid={fieldState.invalid}
                  placeholder="Describe comfort, driving experience, and standout features..."
                  className="min-h-32 resize-y rounded-xl border-border bg-white"
                />
                <FieldDescription>
                  Optional customer-facing copy, up to 3,000 characters.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <Card className="rounded-3xl border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold">Car images</CardTitle>
          <CardDescription>
            Add up to {ADMIN_CAR_IMAGE_UPLOAD.maximumFilesPerRequest} JPG, PNG,
            or WebP images per upload. Each image can be up to 5 MB.
          </CardDescription>
          <CardAction>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {existingImages.length + pendingImages.length} image
              {existingImages.length + pendingImages.length === 1 ? "" : "s"}
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field className="gap-2">
            <FieldLabel htmlFor="car-images">
              <ImagePlus className="size-4" /> Choose images
            </FieldLabel>
            <Input
              id="car-images"
              type="file"
              multiple
              accept={ADMIN_CAR_IMAGE_UPLOAD.acceptedMimeTypes.join(",")}
              disabled={imagesDisabled || imageSelectionFull}
              onChange={(event) => {
                addPendingImages(event.currentTarget.files);
                event.currentTarget.value = "";
              }}
              className="h-12 rounded-xl border-border bg-white file:mr-3 file:rounded-lg file:bg-slate-100 file:px-3"
            />
            <FieldDescription>
              {mode === "create"
                ? "Selected images upload after the car record is created."
                : imageSelectionFull
                  ? "Remove a selected image before choosing another."
                  : "New images upload separately and do not affect unsaved vehicle fields."}
            </FieldDescription>
          </Field>

          {imageError ? (
            <div
              role="alert"
              className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{imageError}</span>
            </div>
          ) : null}

          {uploadMutation.isPending ? (
            <div className="space-y-2" aria-live="polite">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Uploading {pendingImages.length} image
                  {pendingImages.length === 1 ? "" : "s"}
                </span>
                <span className="text-slate-500">{uploadProgress ?? 0}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Image upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadProgress ?? 0}
                className="h-2 overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  className="h-full rounded-full bg-blue-600 transition-[width]"
                  style={{ width: `${uploadProgress ?? 0}%` }}
                />
              </div>
            </div>
          ) : null}

          {existingImages.length === 0 && pendingImages.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-slate-50 px-6 py-10 text-center">
              <ImagePlus className="mx-auto size-8 text-slate-400" />
              <p className="mt-3 font-medium text-slate-700">No car images yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Choose images above to build the vehicle gallery.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {existingImages.map((image) => (
                <ExistingImageCard
                  key={image.id}
                  image={image}
                  carName={carName}
                  disabled={imagesDisabled}
                  active={activeImageId === image.id}
                  onDelete={() => deleteExistingImage(image)}
                  onMakePrimary={() => makePrimaryImage(image)}
                />
              ))}
              {pendingImages.map((image) => (
                <PendingImageCard
                  key={image.id}
                  image={image}
                  disabled={imagesDisabled}
                  onRemove={() => removePendingImage(image.id)}
                />
              ))}
            </div>
          )}

          {mode === "edit" && pendingImages.length > 0 ? (
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={uploadImagesForEdit}
                disabled={imagesDisabled}
                className="rounded-xl"
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Upload />
                )}
                Upload selected images
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {formError ? (
        <div
          role="alert"
          className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">The car could not be saved.</p>
            <p className="mt-1 text-sm text-red-700">{formError}</p>
          </div>
        </div>
      ) : null}

      <Card
        size="sm"
        className="sticky bottom-4 z-20 rounded-2xl border bg-white/95 shadow-lg backdrop-blur"
      >
        <CardFooter className="flex-col justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            {mode === "edit"
              ? isDirty
                ? "You have unsaved vehicle changes."
                : "Vehicle fields are up to date."
              : createdCarId
                ? "The car exists; only image setup remains."
                : "Fields marked by validation must be completed before saving."}
          </p>
          <div className="flex w-full gap-2 sm:w-auto">
            {createdCarId ? (
              <Button
                type="button"
                variant="outline"
                disabled={anyMutationPending}
                onClick={() => {
                  router.push("/admin/cars");
                  router.refresh();
                }}
                className="flex-1 rounded-xl sm:flex-none"
              >
                Finish without images
              </Button>
            ) : (
              <Link
                href="/admin/cars"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "flex-1 rounded-xl sm:flex-none",
                )}
              >
                Cancel
              </Link>
            )}
            <Button
              type="submit"
              size="lg"
              disabled={
                anyMutationPending ||
                (mode === "edit" && !isDirty) ||
                (Boolean(createdCarId) && pendingImages.length === 0)
              }
              className="flex-1 rounded-xl sm:flex-none"
            >
              {fieldMutationPending ||
              (uploadMutation.isPending && mode === "create") ? (
                <Loader2 className="animate-spin" />
              ) : null}
              {submitLabel}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}

function CarInputField({
  control,
  name,
  label,
  prefix,
  className,
  ...inputProps
}: {
  control: CarFormControl;
  name: FieldPath<CarFormInput>;
  label: string;
  prefix?: string;
} & Omit<
  React.ComponentProps<typeof Input>,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref"
>) {
  const inputId = `car-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-2">
          <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
          <div className="relative">
            {prefix ? (
              <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-sm text-slate-500">
                {prefix}
              </span>
            ) : null}
            <Input
              {...inputProps}
              id={inputId}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={
                typeof field.value === "string" ||
                typeof field.value === "number"
                  ? field.value
                  : ""
              }
              aria-invalid={fieldState.invalid}
              className={cn(
                "h-11 rounded-xl border-border bg-white",
                prefix && "pl-7",
                className,
              )}
            />
          </div>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

function CarSelectField<TValue extends string>({
  control,
  name,
  label,
  options,
  disabled,
}: {
  control: CarFormControl;
  name: "transmission" | "fuelType" | "status";
  label: string;
  options: readonly { label: string; value: TValue }[];
  disabled?: boolean;
}) {
  const inputId = `car-${name}`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="gap-2">
          <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
          <Select<TValue>
            items={options}
            value={field.value as TValue}
            disabled={disabled}
            onValueChange={(value) => {
              if (value !== null) field.onChange(value);
            }}
          >
            <SelectTrigger
              id={inputId}
              aria-invalid={fieldState.invalid}
              className="h-11 w-full rounded-xl border-border bg-white"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              align="start"
              alignItemWithTrigger={false}
              className="rounded-xl"
            >
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="rounded-lg"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

function ExistingImageCard({
  image,
  carName,
  disabled,
  active,
  onDelete,
  onMakePrimary,
}: {
  image: AdminCarImage;
  carName: string;
  disabled: boolean;
  active: boolean;
  onDelete: () => void;
  onMakePrimary: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-white">
      <div className="relative aspect-[4/3] bg-slate-100">
        {/* Supabase storage hosts are configured per environment. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt={`${carName} gallery image`}
          className="h-full w-full object-cover"
        />
        {image.isPrimary ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            <Star className="size-3 fill-current" /> Primary
          </span>
        ) : null}
      </div>
      <div className="flex gap-2 p-3">
        {!image.isPrimary ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={onMakePrimary}
            className="flex-1 rounded-lg"
          >
            {active ? <Loader2 className="animate-spin" /> : <Star />}
            Make primary
          </Button>
        ) : (
          <span className="flex flex-1 items-center text-xs font-medium text-slate-500">
            Shown first to customers
          </span>
        )}
        <Button
          type="button"
          size="icon-sm"
          variant="destructive"
          disabled={disabled}
          onClick={onDelete}
          aria-label="Delete image"
          className="rounded-lg"
        >
          {active ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </article>
  );
}

function PendingImageCard({
  image,
  disabled,
  onRemove,
}: {
  image: PendingImage;
  disabled: boolean;
  onRemove: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-dashed border-blue-200 bg-blue-50/40">
      <div className="relative aspect-[4/3] bg-slate-100">
        {/* Blob URLs are local previews and should not use the image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.previewUrl}
          alt={`Selected preview for ${image.file.name}`}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm">
          Ready to upload
        </span>
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          disabled={disabled}
          onClick={onRemove}
          aria-label={`Remove ${image.file.name}`}
          className="absolute right-3 top-3 rounded-full bg-white shadow-sm"
        >
          <X />
        </Button>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-slate-700">
          {image.file.name}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {(image.file.size / (1024 * 1024)).toFixed(1)} MB
        </p>
      </div>
    </article>
  );
}
