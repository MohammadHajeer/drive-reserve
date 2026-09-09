import assert from "node:assert/strict";
import test from "node:test";

import { streamAiCarRecommendations } from "../lib/client/stream-ai-car-recommendations.ts";

const input = {
  pickupDate: "2026-09-10",
  returnDate: "2026-09-12",
  passengers: "4",
  budgetPerDay: 100,
  tripType: "city",
  transmission: "any",
  fuel: "any",
  priority: "overall",
  notes: "",
};

const encoder = new TextEncoder();

function fragmentedSseResponse(body, fragmentSize = 3) {
  const bytes = encoder.encode(body);
  let offset = 0;

  return new Response(
    new ReadableStream({
      pull(controller) {
        if (offset >= bytes.length) {
          controller.close();
          return;
        }

        const nextOffset = Math.min(offset + fragmentSize, bytes.length);
        controller.enqueue(bytes.slice(offset, nextOffset));
        offset = nextOffset;
      },
    }),
    {
      headers: { "Content-Type": "text/event-stream; charset=utf-8" },
    },
  );
}

async function withMockFetch(mockFetch, run) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;

  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("streams every progress event and returns the complete result", async () => {
  const statuses = [];
  let requestInit;

  const response = [
    ": connected\n\n",
    'event: status\ndata: {"step":"validating","message":"Validating your trip details"}\n\n',
    'event: status\ndata: {"step":"finding-cars","message":"Finding vehicles available for your dates"}\n\n',
    'event: status\ndata: {"step":"comparing","message":"Comparing 2 matching vehicles"}\n\n',
    'event: status\ndata: {"step":"preparing","message":"Preparing your recommendations"}\n\n',
    'event: complete\ndata: {"message":"Generated 1 recommendation for your trip.","recommendations":[]}\n\n',
  ].join("");

  await withMockFetch(
    async (_url, init) => {
      requestInit = init;
      return fragmentedSseResponse(response);
    },
    async () => {
      const result = await streamAiCarRecommendations(input, {
        onStatus(status) {
          statuses.push(status);
        },
      });

      assert.equal(result.type, "complete");
      assert.deepEqual(
        statuses.map(({ step }) => step),
        ["validating", "finding-cars", "comparing", "preparing"],
      );
      assert.equal(requestInit.method, "POST");
      assert.equal(requestInit.headers.Accept, "text/event-stream");
      assert.equal(requestInit.headers["Content-Type"], "application/json");
      assert.equal(requestInit.body, JSON.stringify(input));
      assert.equal(requestInit.cache, "no-store");
    },
  );
});

test("returns server validation errors", async () => {
  const response = [
    "event: validation_error",
    'data: {"message":"Please review the trip details and try again.","fieldErrors":{"pickupDate":"Pickup date is required."}}',
    "",
    "",
  ].join("\n");

  await withMockFetch(
    async () => fragmentedSseResponse(response, 1),
    async () => {
      const result = await streamAiCarRecommendations(input);

      assert.equal(result.type, "validation_error");
      assert.equal(
        result.data.fieldErrors.pickupDate,
        "Pickup date is required.",
      );
    },
  );
});

for (const message of [
  "No vehicles match those dates and preferences.",
  "The AI service is temporarily busy. Please try again shortly.",
  "You've made several recommendation requests. Please wait 30 seconds and try again.",
]) {
  test(`returns streamed application errors: ${message}`, async () => {
    const response = `event: error\ndata: ${JSON.stringify({ message })}\n\n`;

    await withMockFetch(
      async () => fragmentedSseResponse(response, 2),
      async () => {
        const result = await streamAiCarRecommendations(input);

        assert.deepEqual(result, { type: "error", data: { message } });
      },
    );
  });
}

test("keeps the existing non-success response error", async () => {
  await withMockFetch(
    async () => new Response("Unavailable", { status: 503 }),
    async () => {
      const result = await streamAiCarRecommendations(input);

      assert.deepEqual(result, {
        type: "error",
        data: {
          message: "Unable to start AI recommendations. Please try again.",
        },
      });
    },
  );
});

test("reports an invalid JSON event payload", async () => {
  await withMockFetch(
    async () => fragmentedSseResponse("event: complete\ndata: not-json\n\n"),
    async () => {
      const result = await streamAiCarRecommendations(input);

      assert.deepEqual(result, {
        type: "error",
        data: {
          message:
            "We received an invalid recommendation response. Please try again.",
        },
      });
    },
  );
});

test("reports a stream that closes without a terminal event", async () => {
  const response =
    'event: status\ndata: {"step":"validating","message":"Validating your trip details"}\n\n';

  await withMockFetch(
    async () => fragmentedSseResponse(response),
    async () => {
      const result = await streamAiCarRecommendations(input);

      assert.deepEqual(result, {
        type: "error",
        data: {
          message:
            "The recommendation stream ended before a result was returned. Please try again.",
        },
      });
    },
  );
});

test("rejects when the transport connection is interrupted", async () => {
  await withMockFetch(
    async () => {
      throw new TypeError("fetch failed");
    },
    async () => {
      await assert.rejects(
        streamAiCarRecommendations(input),
        /recommendation connection was interrupted/i,
      );
    },
  );
});
