import { describe, expect, test } from "bun:test";
import { Luma } from "../../../src/luma";
import { createMockFetch, jsonResponse } from "../../helpers/mock-fetch";

const guest = {
  id: "gst-1",
  user_id: "usr-1",
  user_email: "guest@example.com",
  user_name: "Guest",
  user_first_name: "Guest",
  user_last_name: null,
  approval_status: "approved" as const,
  check_in_qr_code: "qr-1",
  eth_address: null,
  invited_at: null,
  joined_at: null,
  phone_number: null,
  registered_at: "2026-01-01T00:00:00Z",
  registration_answers: null,
  solana_address: null,
  utm_source: null,
  event_tickets: [],
};

describe("EventGuestsResource", () => {
  test("list calls /v1/events/guests/list with event_id", async () => {
    let capturedUrl = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((url) => {
        capturedUrl = url;
        return jsonResponse({ entries: [guest], has_more: false });
      }),
    });

    const result = await luma.events.guests.list("evt-1");

    expect(result.data).toEqual([guest]);
    expect(capturedUrl).toBe(
      "https://public-api.luma.com/v1/events/guests/list?event_id=evt-1",
    );
  });

  test("get calls /v1/events/guests/get with event_id and guest id", async () => {
    let capturedUrl = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((url) => {
        capturedUrl = url;
        return jsonResponse(guest);
      }),
    });

    const result = await luma.events.guests.get("evt-1", "gst-1");

    expect(result).toEqual(guest);
    expect(capturedUrl).toBe(
      "https://public-api.luma.com/v1/events/guests/get?event_id=evt-1&id=gst-1",
    );
  });

  test("add POSTs to /v1/events/guests/add with event_id merged", async () => {
    let capturedUrl = "";
    let capturedBody = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((url, init) => {
        capturedUrl = url;
        capturedBody = init?.body as string;
        return jsonResponse({});
      }),
    });

    await luma.events.guests.add("evt-1", {
      guests: [{ email: "new@example.com" }],
    });

    expect(capturedUrl).toBe("https://public-api.luma.com/v1/events/guests/add");
    expect(JSON.parse(capturedBody)).toEqual({
      event_id: "evt-1",
      guests: [{ email: "new@example.com" }],
    });
  });

  test("updateStatus POSTs to /v1/events/guests/update-status", async () => {
    let capturedUrl = "";
    let capturedBody = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((url, init) => {
        capturedUrl = url;
        capturedBody = init?.body as string;
        return jsonResponse({});
      }),
    });

    await luma.events.guests.updateStatus("evt-1", "gst-1", {
      status: "declined",
    });

    expect(capturedUrl).toBe(
      "https://public-api.luma.com/v1/events/guests/update-status",
    );
    expect(JSON.parse(capturedBody)).toEqual({
      event_id: "evt-1",
      guest_id: "gst-1",
      status: "declined",
    });
  });
});
