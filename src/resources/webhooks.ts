import type { Luma } from "../luma";
import { ValidationError } from "../core/errors";
import { mapListResponse } from "../core/pagination";
import {
  getWebhookHeader,
  verifyWebhookSignature,
  type VerifyWebhookSignatureParams,
} from "../core/webhook-signature";
import {
  WEBHOOK_EVENT_TYPES,
  type ApiWebhookListResponse,
  type UnwrappedWebhookEvent,
  type Webhook,
  type WebhookCreateParams,
  type WebhookEvent,
  type WebhookEventType,
  type WebhookListParams,
  type WebhookUpdateParams,
} from "../types";

export type UnwrapWebhookParams = VerifyWebhookSignatureParams;

const isWebhookEvent = (value: unknown): value is WebhookEvent => {
  if (typeof value !== "object" || value === null) return false;

  const { type } = value as { type?: unknown };
  return (
    typeof type === "string" &&
    WEBHOOK_EVENT_TYPES.has(type as Exclude<WebhookEventType, "*">)
  );
};

const parseWebhookEvent = (rawBody: string): WebhookEvent => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new ValidationError("Invalid webhook JSON body");
  }

  if (!isWebhookEvent(parsed)) throw new ValidationError("Unknown webhook event type");

  return parsed;
};

export class WebhooksResource {
  constructor(private readonly luma: Luma) {}

  create(body: WebhookCreateParams) {
    return this.luma.request<Webhook>("POST", "/v2/webhooks/create", { body });
  }

  get(id: string) {
    return this.luma.request<Webhook>("GET", "/v2/webhooks/get", {
      query: { id },
    });
  }

  list(params?: WebhookListParams) {
    return this.luma
      .request<ApiWebhookListResponse>("GET", "/v1/webhooks/list", {
        query: params,
      })
      .then(mapListResponse);
  }

  update(id: string, body: WebhookUpdateParams) {
    return this.luma.request<Webhook>("POST", "/v2/webhooks/update", {
      body: { id, ...body },
    });
  }

  delete(id: string) {
    return this.luma.request<Record<string, never>>(
      "POST",
      "/v1/webhooks/delete",
      { body: { id } },
    );
  }

  unwrap(params: UnwrapWebhookParams): UnwrappedWebhookEvent {
    verifyWebhookSignature(params);

    const rawBody =
      typeof params.body === "string"
        ? params.body
        : new TextDecoder().decode(params.body);

    const event = parseWebhookEvent(rawBody);

    const id = getWebhookHeader(params.headers, "webhook-id");
    const timestampHeader = getWebhookHeader(params.headers, "webhook-timestamp");

    if (!id) throw new ValidationError("Missing Webhook-Id header");
    if (!timestampHeader) throw new ValidationError("Missing Webhook-Timestamp header");

    const timestamp = Number(timestampHeader);

    if (!Number.isFinite(timestamp)) throw new ValidationError("Invalid Webhook-Timestamp header");

    return {
      ...event,
      id,
      timestamp,
    };
  }
}
