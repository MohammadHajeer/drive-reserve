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
