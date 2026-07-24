import type {
  AdminCar,
  AdminCarApiResponse,
  AdminCarData,
  AdminCarImageData,
  AdminCarImagesData,
  AdminCarImage,
  AdminCarsListData,
  AdminCarsQuery,
  CreateAdminCarInput,
  DeletedAdminCarImageData,
  DeleteAdminCarImageVariables,
  SetPrimaryAdminCarImageVariables,
  UpdateAdminCarInput,
  UploadAdminCarImagesVariables,
} from "../admin-car.types";
import { ADMIN_CAR_IMAGE_UPLOAD } from "../admin-car.types";

const adminCarsPath = "/api/admin/cars";

export class AdminCarRequestError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[] | undefined>,
    public readonly formErrors?: string[],
  ) {
    super(message);
    this.name = "AdminCarRequestError";
  }
}

function adminCarPath(carId: string) {
  return `${adminCarsPath}/${encodeURIComponent(carId)}`;
}

function buildAdminCarsSearchParams(query: AdminCarsQuery) {
  const searchParams = new URLSearchParams();

  if (query.search !== undefined) {
    searchParams.set("search", query.search);
  }

  if (query.status !== undefined) {
    searchParams.set("status", query.status);
  }

  if (query.category !== undefined) {
    searchParams.set("category", query.category);
  }

  if (query.transmission !== undefined) {
    searchParams.set("transmission", query.transmission);
  }

  if (query.sort !== undefined) {
    searchParams.set("sort", query.sort);
  }

  if (query.page !== undefined) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    searchParams.set("limit", String(query.limit));
  }

  return searchParams;
}

async function parseAdminCarResponse<TData>(
  response: Response,
  fallbackMessage: string,
  fallbackCode: string,
): Promise<TData> {
  let result: AdminCarApiResponse<TData>;

  try {
    result = (await response.json()) as AdminCarApiResponse<TData>;
  } catch {
    throw new AdminCarRequestError(
      "The server returned an invalid response.",
      "INVALID_RESPONSE",
      response.status,
    );
  }

  if (
    typeof result !== "object" ||
    result === null ||
    typeof result.success !== "boolean"
  ) {
    throw new AdminCarRequestError(
      "The server returned an invalid response.",
      "INVALID_RESPONSE",
      response.status,
    );
  }

  if (!response.ok || !result.success) {
    const error = !result.success ? result.error : null;

    throw new AdminCarRequestError(
      error?.message ?? fallbackMessage,
      error?.code ?? fallbackCode,
      response.status,
      error?.fieldErrors,
      error?.formErrors,
    );
  }

  return result.data;
}

export async function fetchAdminCars(
  query: AdminCarsQuery = {},
  signal?: AbortSignal,
): Promise<AdminCarsListData> {
  const searchParams = buildAdminCarsSearchParams(query);
  const queryString = searchParams.toString();
  const response = await fetch(
    queryString ? `${adminCarsPath}?${queryString}` : adminCarsPath,
    {
      method: "GET",
      cache: "no-store",
      signal,
    },
  );

  return parseAdminCarResponse<AdminCarsListData>(
    response,
    "Unable to load the cars.",
    "CARS_LOAD_FAILED",
  );
}

export async function fetchAdminCar(
  carId: string,
  signal?: AbortSignal,
): Promise<AdminCar> {
  const response = await fetch(adminCarPath(carId), {
    method: "GET",
    cache: "no-store",
    signal,
  });

  const data = await parseAdminCarResponse<AdminCarData>(
    response,
    "Unable to load the car.",
    "CAR_LOAD_FAILED",
  );

  return data.car;
}

export async function createAdminCar(
  input: CreateAdminCarInput,
): Promise<AdminCar> {
  const response = await fetch(adminCarsPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await parseAdminCarResponse<AdminCarData>(
    response,
    "Unable to create the car.",
    "CAR_CREATION_FAILED",
  );

  return data.car;
}

export async function updateAdminCar(
  carId: string,
  input: UpdateAdminCarInput,
): Promise<AdminCar> {
  const response = await fetch(adminCarPath(carId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await parseAdminCarResponse<AdminCarData>(
    response,
    "Unable to update the car.",
    "CAR_UPDATE_FAILED",
  );

  return data.car;
}

export async function deleteAdminCar(carId: string): Promise<AdminCar> {
  const response = await fetch(adminCarPath(carId), {
    method: "DELETE",
  });

  const data = await parseAdminCarResponse<AdminCarData>(
    response,
    "Unable to deactivate the car.",
    "CAR_DEACTIVATION_FAILED",
  );

  return data.car;
}

export async function uploadAdminCarImages({
  carId,
  images,
  onProgress,
}: UploadAdminCarImagesVariables): Promise<AdminCarImage[]> {
  const formData = new FormData();

  for (const image of images) {
    formData.append(ADMIN_CAR_IMAGE_UPLOAD.fieldName, image);
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("POST", `${adminCarPath(carId)}/images`);

    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    });

    request.addEventListener("load", async () => {
      try {
        const response = new Response(request.responseText, {
          status: request.status,
        });
        const data = await parseAdminCarResponse<AdminCarImagesData>(
          response,
          "Unable to upload the car images.",
          "IMAGE_UPLOAD_FAILED",
        );

        onProgress?.(100);
        resolve(data.images);
      } catch (error) {
        reject(error);
      }
    });

    request.addEventListener("error", () => {
      reject(
        new AdminCarRequestError(
          "Unable to reach the image upload service.",
          "IMAGE_UPLOAD_NETWORK_ERROR",
          0,
        ),
      );
    });

    onProgress?.(0);
    request.send(formData);
  });
}

export async function deleteAdminCarImage({
  carId,
  imageId,
}: DeleteAdminCarImageVariables): Promise<DeletedAdminCarImageData> {
  const response = await fetch(`${adminCarPath(carId)}/images`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageId }),
  });

  return parseAdminCarResponse<DeletedAdminCarImageData>(
    response,
    "Unable to delete the car image.",
    "IMAGE_DELETE_FAILED",
  );
}

export async function setPrimaryAdminCarImage({
  carId,
  imageId,
}: SetPrimaryAdminCarImageVariables): Promise<AdminCarImage> {
  const response = await fetch(`${adminCarPath(carId)}/images`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageId }),
  });

  const data = await parseAdminCarResponse<AdminCarImageData>(
    response,
    "Unable to set the primary car image.",
    "PRIMARY_IMAGE_UPDATE_FAILED",
  );

  return data.image;
}
