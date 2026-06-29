import { describe, expect, test } from "bun:test";
import {
  AuthenticationError,
  RateLimitError,
  ValidationError,
} from "../../src/core/errors";
import {
  buildUrl,
  createHeaders,
  parseResponse,
  request,
} from "../../src/core/http";
import { createMockFetch, jsonResponse } from "../helpers/mock-fetch";

describe("buildUrl", () => {
  test("builds URL with path and query params", () => {
    const url = buildUrl("https://public-api.luma.com", "/v1/events/get", {
      event_id: "evt-123",
      pagination_limit: 20,
    });

    expect(url).toBe(
      "https://public-api.luma.com/v1/events/get?event_id=evt-123&pagination_limit=20",
    );
  });

  test("omits undefined query values", () => {
    const url = buildUrl("https://public-api.luma.com", "/v1/events/get", {
      event_id: "evt-123",
      before: undefined,
    });

    expect(url).toBe(
      "https://public-api.luma.com/v1/events/get?event_id=evt-123",
    );
  });
});

describe("createHeaders", () => {
  test("sets API key header on GET", () => {
    const headers = createHeaders("test-key", "GET");
    expect(headers.get("x-luma-api-key")).toBe("test-key");
    expect(headers.get("Content-Type")).toBeNull();
  });

  test("sets Content-Type on POST", () => {
    const headers = createHeaders("test-key", "POST");
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});

describe("parseResponse", () => {
  test("returns parsed JSON on success", async () => {
    const result = await parseResponse<{ id: string }>(
      jsonResponse({ id: "usr-1" }),
    );
    expect(result).toEqual({ id: "usr-1" });
  });

  test("throws typed errors on failure", async () => {
    await expect(
      parseResponse(jsonResponse({ message: "Unauthorized" }, 401)),
    ).rejects.toThrow(AuthenticationError);

    await expect(
      parseResponse(jsonResponse({ message: "Bad request" }, 400)),
    ).rejects.toThrow(ValidationError);

    await expect(
      parseResponse(jsonResponse({ message: "Slow down" }, 429)),
    ).rejects.toThrow(RateLimitError);
  });
});

describe("request", () => {
  test("sends GET with auth header and query params", async () => {
    let capturedUrl = "";
    let capturedInit: RequestInit | undefined;

    const fetch = createMockFetch((url, init) => {
      capturedUrl = url;
      capturedInit = init;
      return jsonResponse({ id: "evt-1", name: "Meetup" });
    });

    const result = await request(
      { apiKey: "secret", options: { fetch } },
      "GET",
      "/v1/events/get",
      { query: { event_id: "evt-1" } },
    );

    expect(result).toEqual({ id: "evt-1", name: "Meetup" });
    expect(capturedUrl).toBe(
      "https://public-api.luma.com/v1/events/get?event_id=evt-1",
    );
    expect(capturedInit?.method).toBe("GET");
    expect(
      (capturedInit?.headers as Headers).get("x-luma-api-key"),
    ).toBe("secret");
  });

  test("sends POST with JSON body", async () => {
    let capturedInit: RequestInit | undefined;

    const fetch = createMockFetch((_url, init) => {
      capturedInit = init;
      return jsonResponse({ id: "ttype-1", name: "GA", type: "free" });
    });

    await request(
      { apiKey: "secret", options: { fetch } },
      "POST",
      "/v1/events/ticket-types/create",
      { body: { event_id: "evt-1", name: "GA", type: "free" } },
    );

    expect(capturedInit?.method).toBe("POST");
    expect(capturedInit?.body).toBe(
      JSON.stringify({ event_id: "evt-1", name: "GA", type: "free" }),
    );
  });
});
