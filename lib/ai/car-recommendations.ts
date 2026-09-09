export type AiCarRecommendationLabel =
  | "Best overall match"
  | "Best value"
  | "Best for comfort"
  | "Best for fuel efficiency"
  | "Best newer option";

export type AiCarRecommendationView = {
  car: {
    id: string;
    brand: string;
    model: string;
    category: string;
    pricePerDay: number;
    seats: number;
    transmission: string;
    fuelType: string;
    year: number;
    primaryImageUrl: string | null;
  };
  label: AiCarRecommendationLabel;
  reason: string;
};

export type AiRecommendationProgressStep =
  | "validating"
  | "finding-cars"
  | "comparing"
  | "preparing";

export type AiRecommendationStatusEvent = {
  step: AiRecommendationProgressStep;
  message: string;
};

export type AiRecommendationValidationErrorEvent = {
  message: string;
  fieldErrors: Record<string, string>;
};

export type AiRecommendationErrorEvent = {
  message: string;
};

export type AiRecommendationCompleteEvent = {
  message: string;
  recommendations: AiCarRecommendationView[];
};

export type AiRecommendationTerminalEvent =
  | {
      type: "validation_error";
      data: AiRecommendationValidationErrorEvent;
    }
  | {
      type: "error";
      data: AiRecommendationErrorEvent;
    }
  | {
      type: "complete";
      data: AiRecommendationCompleteEvent;
    };
