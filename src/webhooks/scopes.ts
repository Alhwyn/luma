import { ValidationError } from "../core/errors";
import type { WebhookEvent } from "../types";

export const SCOPES = [
  "*",
  "calendar.event.added",
  "calendar.person.subscribed",
  "event.canceled",
  "event.created",
  "event.updated",
  "guest.registered",
  "guest.updated",
  "ticket.registered",
] as const;

export type WebhookScope = (typeof SCOPES)[number];
export type IncomingWebhookScope = Exclude<WebhookScope, "*">;

export const WEBHOOK_EVENT_TYPES = new Set<IncomingWebhookScope>(
  SCOPES.filter((scope): scope is IncomingWebhookScope => scope !== "*"),
);

const VALID_WEBHOOK_EVENT_TYPES = new Set<string>(SCOPES);

export const isWebhookScope = (type: string): type is IncomingWebhookScope =>
  WEBHOOK_EVENT_TYPES.has(type as IncomingWebhookScope);

/** Parse a comma-separated list of webhook scopes (API values). */
export const parseWebhookEventTypes = (value: string): WebhookScope[] => {
  const tokens = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (tokens.length === 0) throw new ValidationError("No webhook event types provided");

  const types: WebhookScope[] = [];
  const invalid: string[] = [];

  for (const token of tokens) {
    if (VALID_WEBHOOK_EVENT_TYPES.has(token)) types.push(token as WebhookScope);
    else invalid.push(token);
  }

  if (invalid.length > 0) {
    throw new ValidationError(`Unknown webhook event type(s): ${invalid.join(", ")}`);
  }

  return types;
};

/** Read webhook event types from `LUMA_WEBHOOK_EVENT_TYPES` (comma-separated). */
export const webhookEventTypesFromEnv = (
  value = process.env.LUMA_WEBHOOK_EVENT_TYPES,
): WebhookScope[] => {
  if (!value?.trim()) throw new ValidationError("LUMA_WEBHOOK_EVENT_TYPES is not set");

  return parseWebhookEventTypes(value);
};

export const parseWebhookPayload = (rawBody: string): WebhookEvent => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new ValidationError("Invalid webhook JSON body");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("type" in parsed) ||
    typeof parsed.type !== "string" ||
    !isWebhookScope(parsed.type)
  ) {
    throw new ValidationError("Unknown webhook event type");
  }

  return parsed as WebhookEvent;
};
