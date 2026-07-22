export type ReservationPreviewInput = {
  carId: string;
  pickupDate: string;
  returnDate: string;
};

export type ReservationUnavailableReason =
  | "CAR_NOT_FOUND"
  | "CAR_NOT_AVAILABLE"
  | "DATES_UNAVAILABLE"
  | null;

export type ReservationPreview = {
  carId: string;
  pickupDate: string;
  returnDate: string;
  rentalDays: number;
  available: boolean;
  pricePerDay: number | null;
  totalPrice: number | null;
  unavailableReason: ReservationUnavailableReason;
};

export type ReservationPreviewSuccessResponse = {
  success: true;
  data: ReservationPreview;
  message: string;
};

export type ReservationPreviewErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export type ReservationPreviewApiResponse =
  | ReservationPreviewSuccessResponse
  | ReservationPreviewErrorResponse;
