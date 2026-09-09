"use client";

import {
  createEventSource,
  type EventSourceMessage,
} from "eventsource-client";

import type {
  AiRecommendationCompleteEvent,
  AiRecommendationErrorEvent,
  AiRecommendationStatusEvent,
  AiRecommendationTerminalEvent,
  AiRecommendationValidationErrorEvent,
} from "@/lib/ai/car-recommendations";
import type { AiCarFinderFormValues } from "@/lib/validations/ai-car-finder";

type StreamOptions = {
  onStatus?: (status: AiRecommendationStatusEvent) => void;
};

const startError: AiRecommendationTerminalEvent = {
  type: "error",
  data: {
    message: "Unable to start AI recommendations. Please try again.",
  },
};

const incompleteStreamError: AiRecommendationTerminalEvent = {
  type: "error",
  data: {
    message:
      "The recommendation stream ended before a result was returned. Please try again.",
  },
};

export async function streamAiCarRecommendations(
  input: AiCarFinderFormValues,
  options: StreamOptions = {},
): Promise<AiRecommendationTerminalEvent> {
  let responseError: AiRecommendationTerminalEvent | null = null;
  let disconnectedNormally = false;

  const eventSource = createEventSource({
    url: "/api/ai/car-recommendations",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    async fetch(url, init) {
      const response = await fetch(url, init);

      if (!response.ok) {
        responseError = startError;
        throw new Error(`Recommendation request failed with ${response.status}`);
      }

      return response;
    },
    onDisconnect() {
      disconnectedNormally = true;
      eventSource.close();
    },
    onScheduleReconnect() {
      eventSource.close();
    },
  });

  try {
    for await (const message of eventSource) {
      const terminalEvent = handleEvent(message, options);

      if (terminalEvent) return terminalEvent;
    }

    if (responseError) return responseError;

    if (!disconnectedNormally) {
      throw new Error("The recommendation connection was interrupted.");
    }

    return incompleteStreamError;
  } finally {
    eventSource.close();
  }
}

function handleEvent(
  message: EventSourceMessage,
  options: StreamOptions,
): AiRecommendationTerminalEvent | null {
  try {
    const data: unknown = JSON.parse(message.data);

    switch (message.event) {
      case "status":
        options.onStatus?.(data as AiRecommendationStatusEvent);
        return null;
      case "validation_error":
        return {
          type: "validation_error",
          data: data as AiRecommendationValidationErrorEvent,
        };
      case "error":
        return {
          type: "error",
          data: data as AiRecommendationErrorEvent,
        };
      case "complete":
        return {
          type: "complete",
          data: data as AiRecommendationCompleteEvent,
        };
      default:
        return null;
    }
  } catch {
    return {
      type: "error",
      data: {
        message:
          "We received an invalid recommendation response. Please try again.",
      },
    };
  }
}
