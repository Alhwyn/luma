import type { Luma } from "../luma";
import { mapListResponse } from "../core/pagination";
import {
  WebhookInboundClient,
  type WebhookInboundClientOptions,
} from "../webhooks/inbound-client";
import type {
  ApiWebhookListResponse,
  Webhook,
  WebhookCreateParams,
  WebhookListParams,
  WebhookUpdateParams,
} from "../types";

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

  client(options: WebhookInboundClientOptions): WebhookInboundClient {
    return new WebhookInboundClient(options);
  }
}
