import { createHmac } from "crypto";
import { describe, expect, test } from "bun:test";
import { ValidationError, WebhookSignatureError } from "../../src/core/errors";
import { Luma } from "../../src/luma";
import { createMockFetch, jsonResponse } from "../helpers/mock-fetch";

const webhook = {
  id: "wh-1",
  url: "https://example.com/webhook",
  event_types: ["guest.updated"] as const,
  status: "active" as const,
  secret: "whsec_test",
  created_at: "2026-01-01T00:00:00.000Z",
};

const sign = (body: string, secret: string, timestamp: number): string => {
  const payload = `${timestamp}.${body}`;
  const v1 = createHmac("sha256", secret).update(payload).digest("hex");
  return `t=${timestamp},v1=${v1}`;
};

describe("WebhooksResource", () => {
  test("create POSTs to /v2/webhooks/create", async () => {
    let capturedUrl = "";
    let capturedBody = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((url, init) => {
        capturedUrl = url;
        capturedBody = init?.body as string;
        return jsonResponse(webhook);
      }),
    });

    const result = await luma.webhooks.create({
      url: webhook.url,
      event_types: ["guest.updated"],
    });

    expect(result).toEqual(webhook);
    expect(capturedUrl).toBe("https://public-api.luma.com/v2/webhooks/create");
    expect(JSON.parse(capturedBody)).toEqual({
      url: webhook.url,
      event_types: ["guest.updated"],
    });
  });

  test("get calls /v2/webhooks/get with id", async () => {
    let capturedUrl = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((url) => {
        capturedUrl = url;
        return jsonResponse(webhook);
      }),
    });

    const result = await luma.webhooks.get("wh-1");

    expect(result).toEqual(webhook);
    expect(capturedUrl).toBe(
      "https://public-api.luma.com/v2/webhooks/get?id=wh-1",
    );
  });

  test("list calls /v1/webhooks/list and maps response", async () => {
    let capturedUrl = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((url) => {
        capturedUrl = url;
        return jsonResponse({
          entries: [webhook],
          has_more: false,
        });
      }),
    });

    const result = await luma.webhooks.list({ pagination_limit: 10 });

    expect(result.data).toEqual([webhook]);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
    expect(capturedUrl).toBe(
      "https://public-api.luma.com/v1/webhooks/list?pagination_limit=10",
    );
  });

  test("update POSTs to /v2/webhooks/update", async () => {
    let capturedBody = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((_url, init) => {
        capturedBody = init?.body as string;
        return jsonResponse({ ...webhook, status: "paused" });
      }),
    });

    const result = await luma.webhooks.update("wh-1", { status: "paused" });

    expect(result.status).toBe("paused");
    expect(JSON.parse(capturedBody)).toEqual({
      id: "wh-1",
      status: "paused",
    });
  });

  test("delete POSTs to /v1/webhooks/delete", async () => {
    let capturedUrl = "";
    let capturedBody = "";

    const luma = new Luma("test-key", {
      fetch: createMockFetch((url, init) => {
        capturedUrl = url;
        capturedBody = init?.body as string;
        return jsonResponse({});
      }),
    });

    await luma.webhooks.delete("wh-1");

    expect(capturedUrl).toBe("https://public-api.luma.com/v1/webhooks/delete");
    expect(JSON.parse(capturedBody)).toEqual({ id: "wh-1" });
  });

  describe("unwrap", () => {
    const guestUpdatedBody = JSON.stringify({
      type: "guest.updated",
      data: {
        id: "gst-1",
        user_email: "jane@example.com",
        event_tickets: [{ checked_in_at: "2026-01-01T12:00:00.000Z" }],
      },
    });
    const timestamp = Math.floor(Date.now() / 1000);

    test("returns a typed event when signature and headers are valid", () => {
      const luma = new Luma("test-key");

      const event = luma.webhooks.unwrap({
        body: guestUpdatedBody,
        secret: webhook.secret,
        headers: {
          "Webhook-Signature": sign(guestUpdatedBody, webhook.secret, timestamp),
          "Webhook-Id": "msg-1",
          "Webhook-Timestamp": String(timestamp),
        },
      });

      expect(event.type).toBe("guest.updated");
      expect(event.id).toBe("msg-1");
      expect(event.timestamp).toBe(timestamp);
      if (event.type === "guest.updated") {
        expect(event.data.user_email).toBe("jane@example.com");
      }
    });

    test("rejects an invalid signature", () => {
      const luma = new Luma("test-key");

      expect(() =>
        luma.webhooks.unwrap({
          body: guestUpdatedBody,
          secret: webhook.secret,
          headers: {
            "Webhook-Signature": "t=0,v1=bad",
            "Webhook-Id": "msg-1",
            "Webhook-Timestamp": String(timestamp),
          },
        }),
      ).toThrow(WebhookSignatureError);
    });

    test("rejects an unknown event type", () => {
      const body = JSON.stringify({ type: "guest.checked_in", data: {} });
      const luma = new Luma("test-key");

      expect(() =>
        luma.webhooks.unwrap({
          body,
          secret: webhook.secret,
          headers: {
            "Webhook-Signature": sign(body, webhook.secret, timestamp),
            "Webhook-Id": "msg-1",
            "Webhook-Timestamp": String(timestamp),
          },
        }),
      ).toThrow(ValidationError);
    });

    test("rejects missing webhook metadata headers", () => {
      const luma = new Luma("test-key");

      expect(() =>
        luma.webhooks.unwrap({
          body: guestUpdatedBody,
          secret: webhook.secret,
          headers: {
            "Webhook-Signature": sign(guestUpdatedBody, webhook.secret, timestamp),
          },
        }),
      ).toThrow(ValidationError);
    });
  });
});
