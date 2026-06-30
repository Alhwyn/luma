import { describe, expect, test } from "bun:test";
import { ValidationError } from "../../src/core/errors";
import {
  isWebhookScope,
  parseWebhookEventTypes,
  parseWebhookPayload,
  SCOPES,
  webhookEventTypesFromEnv,
} from "../../src/webhooks/scopes";

describe("SCOPES", () => {
  test("lists all valid webhook scope values", () => {
    expect(SCOPES).toEqual([
      "*",
      "calendar.event.added",
      "calendar.person.subscribed",
      "event.canceled",
      "event.created",
      "event.updated",
      "guest.registered",
      "guest.updated",
      "ticket.registered",
    ]);
  });

  test("isWebhookScope recognizes API scope values", () => {
    expect(isWebhookScope("guest.updated")).toBe(true);
    expect(isWebhookScope("guest.confirmed")).toBe(false);
  });

  test("parseWebhookEventTypes splits comma-separated API values", () => {
    expect(parseWebhookEventTypes("guest.updated,guest.registered")).toEqual([
      "guest.updated",
      "guest.registered",
    ]);
  });

  test("parseWebhookEventTypes trims whitespace", () => {
    expect(parseWebhookEventTypes(" guest.updated , guest.registered ")).toEqual([
      "guest.updated",
      "guest.registered",
    ]);
  });

  test("parseWebhookEventTypes accepts all scopes", () => {
    expect(parseWebhookEventTypes("*")).toEqual(["*"]);
  });

  test("parseWebhookEventTypes rejects PascalCase scope names", () => {
    expect(() => parseWebhookEventTypes("GuestUpdated,GuestRegistered")).toThrow(
      ValidationError,
    );
  });

  test("parseWebhookEventTypes rejects unknown types", () => {
    expect(() => parseWebhookEventTypes("guest.confirmed")).toThrow(ValidationError);
  });

  test("parseWebhookEventTypes rejects empty string", () => {
    expect(() => parseWebhookEventTypes("")).toThrow(ValidationError);
  });

  test("webhookEventTypesFromEnv reads from argument", () => {
    expect(webhookEventTypesFromEnv("guest.updated")).toEqual(["guest.updated"]);
  });

  test("webhookEventTypesFromEnv throws when unset", () => {
    expect(() => webhookEventTypesFromEnv("")).toThrow(ValidationError);
    expect(() => webhookEventTypesFromEnv(undefined)).toThrow(ValidationError);
  });

  test("parseWebhookPayload parses a valid webhook body", () => {
    const payload = parseWebhookPayload(
      JSON.stringify({
        type: "guest.updated",
        data: { user_email: "jane@example.com" },
      }),
    );

    expect(payload.type).toBe("guest.updated");
  });

  test("parseWebhookPayload rejects unknown types", () => {
    expect(() =>
      parseWebhookPayload(JSON.stringify({ type: "guest.confirmed", data: {} })),
    ).toThrow(ValidationError);
  });
});
