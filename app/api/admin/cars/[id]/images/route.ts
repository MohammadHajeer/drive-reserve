import { randomUUID } from "node:crypto";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const carIdSchema = z.uuid();

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const maximumImageSize = 5 * 1024 * 1024;
const maximumImagesPerRequest = 6;
const deleteCarImageSchema = z
  .object({
    imageId: z.uuid(),
  })
  .strict();
const setPrimaryCarImageSchema = z
  .object({
    imageId: z.uuid(),
  })
  .strict();

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const uploadedPaths: string[] = [];

  try {
    const { id } = await context.params;

    const parsedId = carIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CAR_ID",
            message: "The provided car ID is invalid.",
          },
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication is required.",
          },
        },
        { status: 401 },
      );
    }

    if (claimsData.claims.user_role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Administrator access is required.",
          },
        },
        { status: 403 },
      );
    }

    const { data: car, error: carError } = await supabase
      .from("cars")
      .select("id")
      .eq("id", parsedId.data)
      .maybeSingle();

    if (carError) {
      console.error("Car lookup error:", carError);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAR_LOAD_FAILED",
            message: "Unable to verify the car.",
          },
        },
        { status: 500 },
      );
    }

    if (!car) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAR_NOT_FOUND",
            message: "The requested car was not found.",
          },
        },
        { status: 404 },
      );
    }

    const formData = await request.formData();

    const images = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File);

    if (images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "IMAGES_REQUIRED",
            message: "Select at least one car image.",
          },
        },
        { status: 400 },
      );
    }

    if (images.length > maximumImagesPerRequest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOO_MANY_IMAGES",
            message: `Upload no more than ${maximumImagesPerRequest} images at once.`,
          },
        },
        { status: 400 },
      );
    }

    for (const image of images) {
      if (!allowedImageTypes.has(image.type)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_IMAGE_TYPE",
              message: "Images must be JPG, PNG, or WebP.",
            },
          },
          { status: 400 },
        );
      }

      if (image.size > maximumImageSize) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "IMAGE_TOO_LARGE",
              message: "Each image must be 5 MB or smaller.",
            },
          },
          { status: 400 },
        );
      }
    }

    const { data: existingImages, error: existingImagesError } = await supabase
      .from("car_images")
      .select("is_primary, display_order")
      .eq("car_id", parsedId.data);

    if (existingImagesError) {
      console.error("Existing car images load error:", existingImagesError);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "IMAGES_LOAD_FAILED",
            message: "Unable to load the existing car images.",
          },
        },
        { status: 500 },
      );
    }

    const hasPrimaryImage = (existingImages ?? []).some(
      (image) => image.is_primary,
    );

    const maximumDisplayOrder = Math.max(
      -1,
      ...(existingImages ?? []).map((image) => image.display_order),
    );

    for (const image of images) {
      const extension = allowedImageTypes.get(image.type)!;

      const storagePath = `cars/${parsedId.data}/${randomUUID()}.${extension}`;

      const imageBuffer = await image.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("car-images")
        .upload(storagePath, imageBuffer, {
          contentType: image.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Car image upload error:", uploadError);

        if (uploadedPaths.length > 0) {
          await supabase.storage.from("car-images").remove(uploadedPaths);
        }

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "IMAGE_UPLOAD_FAILED",
              message: "Unable to upload the car images.",
            },
          },
          { status: 500 },
        );
      }

      uploadedPaths.push(storagePath);
    }

    const imageRows = uploadedPaths.map((path, index) => ({
      car_id: parsedId.data,
      image_url: path,
      is_primary: !hasPrimaryImage && index === 0,
      display_order: maximumDisplayOrder + index + 1,
    }));

    const { data: createdImages, error: databaseError } = await supabase
      .from("car_images")
      .insert(imageRows)
      .select(
        `
            id,
            image_url,
            is_primary,
            display_order
          `,
      );

    if (databaseError) {
      console.error("Car image database error:", databaseError);

      await supabase.storage.from("car-images").remove(uploadedPaths);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "IMAGE_RECORD_CREATION_FAILED",
            message: "Unable to save the car image information.",
          },
        },
        { status: 500 },
      );
    }

    const responseImages = (createdImages ?? []).map((image) => ({
      id: image.id,
      path: image.image_url,
      url: supabase.storage.from("car-images").getPublicUrl(image.image_url)
        .data.publicUrl,
      isPrimary: image.is_primary,
      displayOrder: image.display_order,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          images: responseImages,
        },
        message: "Car images uploaded successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Car images route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await context.params;
    const parsedId = carIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CAR_ID",
            message: "The provided car ID is invalid.",
          },
        },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "The request body must contain valid JSON.",
          },
        },
        { status: 400 },
      );
    }

    const parsedBody = setPrimaryCarImageSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please provide a valid car image ID.",
            fieldErrors: parsedBody.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication is required.",
          },
        },
        { status: 401 },
      );
    }

    if (claimsData.claims.user_role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Administrator access is required.",
          },
        },
        { status: 403 },
      );
    }

    const { data: targetImage, error: targetImageError } = await supabase
      .from("car_images")
      .select("id, image_url, is_primary, display_order")
      .eq("id", parsedBody.data.imageId)
      .eq("car_id", parsedId.data)
      .maybeSingle();

    if (targetImageError) {
      console.error("Primary image lookup error:", targetImageError);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "IMAGE_LOAD_FAILED",
            message: "Unable to load the selected car image.",
          },
        },
        { status: 500 },
      );
    }

    if (!targetImage) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "IMAGE_NOT_FOUND",
            message: "The requested car image was not found.",
          },
        },
        { status: 404 },
      );
    }

    let responseImage = targetImage;

    if (!targetImage.is_primary) {
      const { data: currentPrimary, error: currentPrimaryError } =
        await supabase
          .from("car_images")
          .select("id")
          .eq("car_id", parsedId.data)
          .eq("is_primary", true)
          .maybeSingle();

      if (currentPrimaryError) {
        console.error("Current primary image lookup error:", currentPrimaryError);

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PRIMARY_IMAGE_LOAD_FAILED",
              message: "Unable to load the current primary image.",
            },
          },
          { status: 500 },
        );
      }

      if (currentPrimary) {
        const { error: unsetPrimaryError } = await supabase
          .from("car_images")
          .update({ is_primary: false })
          .eq("id", currentPrimary.id)
          .eq("car_id", parsedId.data);

        if (unsetPrimaryError) {
          console.error("Primary image reset error:", unsetPrimaryError);

          return NextResponse.json(
            {
              success: false,
              error: {
                code: "PRIMARY_IMAGE_UPDATE_FAILED",
                message: "Unable to update the primary image.",
              },
            },
            { status: 500 },
          );
        }
      }

      const { data: updatedImage, error: updateError } = await supabase
        .from("car_images")
        .update({ is_primary: true })
        .eq("id", targetImage.id)
        .eq("car_id", parsedId.data)
        .select("id, image_url, is_primary, display_order")
        .single();

      if (updateError) {
        console.error("Set primary image error:", updateError);

        if (currentPrimary) {
          await supabase
            .from("car_images")
            .update({ is_primary: true })
            .eq("id", currentPrimary.id)
            .eq("car_id", parsedId.data);
        }

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "PRIMARY_IMAGE_UPDATE_FAILED",
              message: "Unable to update the primary image.",
            },
          },
          { status: 500 },
        );
      }

      responseImage = updatedImage;
    }

    return NextResponse.json({
      success: true,
      data: {
        image: {
          id: responseImage.id,
          path: responseImage.image_url,
          url: supabase.storage
            .from("car-images")
            .getPublicUrl(responseImage.image_url).data.publicUrl,
          isPrimary: true,
          displayOrder: responseImage.display_order,
        },
      },
      message: "Primary image updated successfully.",
    });
  } catch (error) {
    console.error("Set primary car image route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await context.params;

    const parsedId = carIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CAR_ID",
            message: "The provided car ID is invalid.",
          },
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    if (claimsError || !claimsData?.claims?.sub) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication is required.",
          },
        },
        { status: 401 },
      );
    }

    if (claimsData.claims.user_role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Administrator access is required.",
          },
        },
        { status: 403 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "The request body must contain valid JSON.",
          },
        },
        { status: 400 },
      );
    }

    const parsedBody = deleteCarImageSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please provide a valid car image ID.",
            fieldErrors: parsedBody.error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }

    const { data: car, error: carError } = await supabase
      .from("cars")
      .select("id")
      .eq("id", parsedId.data)
      .maybeSingle();

    if (carError) {
      console.error("Car lookup error:", carError);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAR_LOAD_FAILED",
            message: "Unable to verify the car.",
          },
        },
        { status: 500 },
      );
    }

    if (!car) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAR_NOT_FOUND",
            message: "The requested car was not found.",
          },
        },
        { status: 404 },
      );
    }

    const { data: image, error: imageError } = await supabase
      .from("car_images")
      .select("id, image_url, is_primary")
      .eq("id", parsedBody.data.imageId)
      .eq("car_id", parsedId.data)
      .maybeSingle();

    if (imageError) {
      console.error("Car image lookup error:", imageError);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "IMAGE_LOAD_FAILED",
            message: "Unable to load the car image.",
          },
        },
        { status: 500 },
      );
    }

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "IMAGE_NOT_FOUND",
            message: "The requested car image was not found.",
          },
        },
        { status: 404 },
      );
    }

    const { error: deleteError } = await supabase
      .from("car_images")
      .delete()
      .eq("id", image.id)
      .eq("car_id", parsedId.data);

    if (deleteError) {
      console.error("Car image delete error:", deleteError);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "IMAGE_DELETE_FAILED",
            message: "Unable to delete the car image.",
          },
        },
        { status: 500 },
      );
    }

    let primaryImageUpdateFailed = false;

    if (image.is_primary) {
      const { data: nextImage, error: nextImageError } = await supabase
        .from("car_images")
        .select("id")
        .eq("car_id", parsedId.data)
        .order("display_order", { ascending: true })
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextImageError) {
        console.error("Next primary image lookup error:", nextImageError);

        primaryImageUpdateFailed = true;
      }

      if (nextImage && !primaryImageUpdateFailed) {
        const { error: primaryImageError } = await supabase
          .from("car_images")
          .update({ is_primary: true })
          .eq("id", nextImage.id)
          .eq("car_id", parsedId.data);

        if (primaryImageError) {
          console.error("Primary image update error:", primaryImageError);

          primaryImageUpdateFailed = true;
        }
      }
    }

    const { error: storageError } = await supabase.storage
      .from("car-images")
      .remove([image.image_url]);

    if (storageError) {
      console.error("Car image storage delete error:", storageError);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "IMAGE_STORAGE_DELETE_FAILED",
            message: "The image record was deleted, but the stored file could not be removed.",
          },
        },
        { status: 500 },
      );
    }

    if (primaryImageUpdateFailed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRIMARY_IMAGE_UPDATE_FAILED",
            message:
              "The image was deleted, but the primary image could not be updated.",
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        imageId: image.id,
      },
      message: "Car image deleted successfully.",
    });
  } catch (error) {
    console.error("Delete car image route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        },
      },
      { status: 500 },
    );
  }
}
