import { ValidationError } from "../core/errors";
import {
  getWebhookHeader,
  verifyWebhookSignature,
} from "../core/webhook-signature";
import { parseWebhookPayload } from "./scopes";
import type { UnwrappedWebhookEvent } from "../types";

export type WebhookInboundClientOptions = {
  secret: string;
  tolerance?: number;
};

export type VerifyWebhookParams = {
  body: string | Uint8Array;
  headers: Headers | Record<string, string | string[] | undefined>;
};

export class WebhookInboundClient {
  constructor(private readonly options: WebhookInboundClientOptions) {}

  verify(params: VerifyWebhookParams): UnwrappedWebhookEvent {
    verifyWebhookSignature({
      ...params,
      secret: this.options.secret,
      tolerance: this.options.tolerance,
    });

    const rawBody =
      typeof params.body === "string"
        ? params.body
        : new TextDecoder().decode(params.body);

    const event = parseWebhookPayload(rawBody);

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
