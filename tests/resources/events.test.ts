import { describe, expect, test } from "bun:test";
import { Luma } from "../../src/luma";
import { createMockFetch, jsonResponse } from "../helpers/mock-fetch";

const event = {
  platform: "luma" as const,
  id: "evt-1",
  name: "Demo Event",
};

describe("EventsResource", () => {
  test("get calls /v1/events/get with event_id", async () => {
    let capturedUrl = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((url) => {
        capturedUrl = url;
        return jsonResponse(event);
      }),
    });

    const result = await luma.events.get("evt-1");

    expect(result).toEqual(event);
    expect(capturedUrl).toBe(
      "https://public-api.luma.com/v1/events/get?event_id=evt-1",
    );
  });

  test("list calls /v1/calendars/events/list and maps response", async () => {
    let capturedUrl = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((url) => {
        capturedUrl = url;
        return jsonResponse({
          entries: [event],
          has_more: false,
        });
      }),
    });

    const result = await luma.events.list({ pagination_limit: 10 });

    expect(result.data).toEqual([event]);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
    expect(capturedUrl).toBe(
      "https://public-api.luma.com/v1/calendars/events/list?pagination_limit=10",
    );
  });

  test("create POSTs to /v1/events/create", async () => {
    let capturedUrl = "";
    let capturedBody = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((url, init) => {
        capturedUrl = url;
        capturedBody = init?.body as string;
        return jsonResponse(event);
      }),
    });

    await luma.events.create({ name: "Demo Event", start_at: "2026-01-01T00:00:00Z" });

    expect(capturedUrl).toBe("https://public-api.luma.com/v1/events/create");
    expect(JSON.parse(capturedBody)).toEqual({
      name: "Demo Event",
      start_at: "2026-01-01T00:00:00Z",
    });
  });

  test("update POSTs event_id merged into body", async () => {
    let capturedBody = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((_url, init) => {
        capturedBody = init?.body as string;
        return jsonResponse(event);
      }),
    });

    await luma.events.update("evt-1", { name: "Updated" });

    expect(JSON.parse(capturedBody)).toEqual({
      event_id: "evt-1",
      name: "Updated",
    });
  });
});
