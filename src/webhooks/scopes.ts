import { ValidationError } from "../core/errors";
import type { WebhookEvent } from "../types";

/** Named scopes for Luma webhook event types. */
export const WebhookScopes = {
  CalendarEventAdded: "calendar.event.added",
  CalendarPersonSubscribed: "calendar.person.subscribed",
  EventCanceled: "event.canceled",
  EventCreated: "event.created",
  EventUpdated: "event.updated",
  GuestRegistered: "guest.registered",
  GuestUpdated: "guest.updated",
  TicketRegistered: "ticket.registered",
  All: "*",
} as const;

export type WebhookScope = (typeof WebhookScopes)[keyof typeof WebhookScopes];
export type IncomingWebhookScope = Exclude<WebhookScope, "*">;

export const WEBHOOK_EVENT_TYPES = new Set<IncomingWebhookScope>(
  Object.values(WebhookScopes).filter(
    (scope): scope is IncomingWebhookScope => scope !== WebhookScopes.All,
  ),
);

const VALID_WEBHOOK_EVENT_TYPES = new Set<string>([
  ...WEBHOOK_EVENT_TYPES,
  WebhookScopes.All,
]);

export const isWebhookScope = (type: string): type is IncomingWebhookScope =>
  WEBHOOK_EVENT_TYPES.has(type as IncomingWebhookScope);

const resolveWebhookScopeToken = (token: string): WebhookScope | undefined => {
  if (token in WebhookScopes) {
    return WebhookScopes[token as keyof typeof WebhookScopes];
  }

  if (VALID_WEBHOOK_EVENT_TYPES.has(token)) return token as WebhookScope;

  return undefined;
};

/** Parse a comma-separated list of webhook scopes (API values or scope names). */
export const parseWebhookEventTypes = (value: string): WebhookScope[] => {
  const tokens = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    throw new ValidationError("No webhook event types provided");
  }

  const types: WebhookScope[] = [];
  const invalid: string[] = [];

  for (const token of tokens) {
    const scope = resolveWebhookScopeToken(token);
    if (scope) types.push(scope);
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
  if (!value?.trim()) {
    throw new ValidationError("LUMA_WEBHOOK_EVENT_TYPES is not set");
  }

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
