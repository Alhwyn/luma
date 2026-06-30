import { describe, expect, test } from "bun:test";
import { ValidationError } from "../../src/core/errors";
import {
  isWebhookScope,
  parseWebhookEventTypes,
  parseWebhookPayload,
  WebhookScopes,
  webhookEventTypesFromEnv,
} from "../../src/webhooks/scopes";

describe("WebhookScopes", () => {
  test("isWebhookScope recognizes API scope values", () => {
    expect(isWebhookScope(WebhookScopes.GuestUpdated)).toBe(true);
    expect(isWebhookScope("guest.confirmed")).toBe(false);
  });

  test("parseWebhookEventTypes splits comma-separated API values", () => {
    expect(
      parseWebhookEventTypes(
        `${WebhookScopes.GuestUpdated},${WebhookScopes.GuestRegistered}`,
      ),
    ).toEqual([WebhookScopes.GuestUpdated, WebhookScopes.GuestRegistered]);
  });

  test("parseWebhookEventTypes accepts scope names", () => {
    expect(parseWebhookEventTypes("GuestUpdated,GuestRegistered")).toEqual([
      WebhookScopes.GuestUpdated,
      WebhookScopes.GuestRegistered,
    ]);
  });

  test("parseWebhookEventTypes trims whitespace", () => {
    expect(parseWebhookEventTypes(" GuestUpdated , guest.registered ")).toEqual([
      WebhookScopes.GuestUpdated,
      WebhookScopes.GuestRegistered,
    ]);
  });

  test("parseWebhookEventTypes accepts all scopes", () => {
    expect(parseWebhookEventTypes("All")).toEqual([WebhookScopes.All]);
  });

  test("parseWebhookEventTypes rejects unknown types", () => {
    expect(() => parseWebhookEventTypes("guest.confirmed")).toThrow(ValidationError);
  });

  test("parseWebhookEventTypes rejects empty string", () => {
    expect(() => parseWebhookEventTypes("")).toThrow(ValidationError);
  });

  test("webhookEventTypesFromEnv reads from argument", () => {
    expect(webhookEventTypesFromEnv("GuestUpdated")).toEqual([
      WebhookScopes.GuestUpdated,
    ]);
  });

  test("webhookEventTypesFromEnv throws when unset", () => {
    expect(() => webhookEventTypesFromEnv("")).toThrow(ValidationError);
    expect(() => webhookEventTypesFromEnv(undefined)).toThrow(ValidationError);
  });

  test("parseWebhookPayload parses a valid webhook body", () => {
    const payload = parseWebhookPayload(
      JSON.stringify({
        type: WebhookScopes.GuestUpdated,
        data: { user_email: "jane@example.com" },
      }),
    );

    expect(payload.type).toBe(WebhookScopes.GuestUpdated);
  });

  test("parseWebhookPayload rejects unknown types", () => {
    expect(() =>
      parseWebhookPayload(JSON.stringify({ type: "guest.confirmed", data: {} })),
    ).toThrow(ValidationError);
  });
});
