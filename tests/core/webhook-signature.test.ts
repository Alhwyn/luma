import { createHmac } from "crypto";
import { describe, expect, test } from "bun:test";
import { WebhookSignatureError } from "../../src/core/errors";
import { verifyWebhookSignature } from "../../src/core/webhook-signature";
import { WebhookScopes } from "../../src/webhooks/scopes";

const sign = (body: string, secret: string, timestamp: number): string => {
  const payload = `${timestamp}.${body}`;
  const v1 = createHmac("sha256", secret).update(payload).digest("hex");
  return `t=${timestamp},v1=${v1}`;
};

describe("verifyWebhookSignature", () => {
  const body = JSON.stringify({ type: WebhookScopes.GuestUpdated, data: {} });
  const secret = "whsec_test";
  const timestamp = Math.floor(Date.now() / 1000);

  test("accepts a valid signature", () => {
    expect(
      verifyWebhookSignature({
        body,
        secret,
        headers: { "Webhook-Signature": sign(body, secret, timestamp) },
      }),
    ).toEqual({ timestamp });
  });

  test("accepts Uint8Array body", () => {
    expect(() =>
      verifyWebhookSignature({
        body: new TextEncoder().encode(body),
        secret,
        headers: { "Webhook-Signature": sign(body, secret, timestamp) },
      }),
    ).not.toThrow();
  });

  test("rejects a tampered body", () => {
    expect(() =>
      verifyWebhookSignature({
        body: JSON.stringify({
          type: WebhookScopes.GuestUpdated,
          data: { tampered: true },
        }),
        secret,
        headers: { "Webhook-Signature": sign(body, secret, timestamp) },
      }),
    ).toThrow(WebhookSignatureError);
  });

  test("rejects a wrong secret", () => {
    expect(() =>
      verifyWebhookSignature({
        body,
        secret: "whsec_wrong",
        headers: { "Webhook-Signature": sign(body, secret, timestamp) },
      }),
    ).toThrow(WebhookSignatureError);
  });

  test("rejects a timestamp outside tolerance", () => {
    const expired = timestamp - 600;
    expect(() =>
      verifyWebhookSignature({
        body,
        secret,
        headers: { "Webhook-Signature": sign(body, secret, expired) },
      }),
    ).toThrow(WebhookSignatureError);
  });

  test("rejects a future timestamp outside tolerance", () => {
    const future = timestamp + 600;
    expect(() =>
      verifyWebhookSignature({
        body,
        secret,
        headers: { "Webhook-Signature": sign(body, secret, future) },
      }),
    ).toThrow(WebhookSignatureError);
  });

  test("rejects a missing header", () => {
    expect(() =>
      verifyWebhookSignature({
        body,
        secret,
        headers: {},
      }),
    ).toThrow(WebhookSignatureError);
  });
});
