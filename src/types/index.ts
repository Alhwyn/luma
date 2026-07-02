import type { paths, operations } from "./generated";
import type { ListResponse as SdkListResponse } from "../core/pagination";

// Helpers 
type GetResponse<Path extends keyof paths> = 
  paths[Path]["get"] extends {
    responses: { 200: { content: { "application/json": infer T } } }
  } ? T : never;

type PostResponse<Path extends keyof paths> = 
  paths[Path]["post"] extends {
    responses: { 200: { content: { "application/json": infer T } } }
  } ? T : never;

type PostBody<Path extends keyof paths> =
  paths[Path]["post"] extends {
    requestBody: { content: { "application/json": infer T } }
  } ? T : never;

type GetQuery<Path extends keyof paths> = 
  paths[Path]["get"] extends { parameters: { query?: infer Q } } ? Q : never;

type WebhookRequestBody<Op extends keyof operations> = 
  operations[Op] extends {
    requestBody: { content: { "application/json": infer T } }
  } ? T : never;

type WebhookEventCreated             = WebhookRequestBody<"webhook_event_created">;
type WebhookEventUpdated             = WebhookRequestBody<"webhook_event_updated">; 
type WebhookEventCanceled            = WebhookRequestBody<"webhook_event_canceled">;
type WebhookGuestRegistered          = WebhookRequestBody<"webhook_guest_registered">; 
type WebhookGuestUpdated             = WebhookRequestBody<"webhook_guest_updated">;  
type WebhookTicketRegistered         = WebhookRequestBody<"webhook_ticket_registered">;  
type WebhookCalendarPersonSubscribed = WebhookRequestBody<"webhook_calendar_person_subscribed">; 
type WebhookCalendarEventAdded       = WebhookRequestBody<"webhook_calendar_event_added">; 

// Entity Types
export type User       = GetResponse<"/v1/users/get-self">; 
export type Calendar   = GetResponse<"/v1/calendars/get">; 
export type Event      = GetResponse<"/v1/events/get">; 
export type Guest      = GetResponse<"/v1/events/guests/get">;
export type TicketType = GetResponse<"/v1/events/ticket-types/get">;

// List entry types (from list responses)
export type EventListEntry  = GetResponse<"/v1/calendars/events/list">["entries"][number];
export type EventListParams = Omit<GetQuery<"/v1/calendars/events/list">, never>; 
export type GuestListEntry = GetResponse<"/v1/events/guests/list">["entries"][number];
export type TicketTypeListEntry = GetResponse<"/v1/events/ticket-types/list">["entries"][number]; 

// API list response shapes (before mapping)
export type ApiEventListResponse = GetResponse<"/v1/calendars/events/list">; 
export type ApiGuestListResponse = GetResponse<"/v1/events/guests/list">;  
export type ApiTicketTypeListResponse = GetResponse<"/v1/events/ticket-types/list">;
export type ApiWebhookListResponse = GetResponse<"/v1/webhooks/list">;
export type WebhookListEntry = ApiWebhookListResponse["entries"][number]; 

// Request param/body types
export type GuestListParams = Omit<GetQuery<"/v1/events/guests/list">, "event_id">;
export type EventCreateParams = PostBody<"/v1/events/create">;
export type EventUpdateParams = Omit<PostBody<"/v1/events/update">, "event_id">;
export type CalendarUpdateParams = Omit<PostBody<"/v1/calendars/update">, "calendar_id">;
export type GuestAddParams = Omit<PostBody<"/v1/events/guests/add">, "event_id">;
export type GuestSendInvitesParams = Omit<PostBody<"/v1/events/guests/send-invites">, "event_id">;
export type GuestUpdateStatusParams = Omit<PostBody<"/v1/events/guests/update-status">, "event_id" | "guest_id">;
export type TicketTypeCreateParams = Omit<PostBody<"/v1/events/ticket-types/create">, "event_id">;
export type TicketTypeUpdateParams = Omit<PostBody<"/v1/events/ticket-types/update">, "event_id" | "event_ticket_type_id">;

// Webhook entity + outbound API types
export type Webhook = PostResponse<"/v2/webhooks/create">;
export type WebhookCreateParams = PostBody<"/v2/webhooks/create">;
export type WebhookUpdateParams = Omit<PostBody<"/v2/webhooks/update">, "id">;
export type WebhookListParams = GetQuery<"/v1/webhooks/list">;
export type { WebhookScope, WebhookScope as WebhookEventType } from "../webhooks/scopes";

export type WebhookEvent =
  | WebhookEventCreated
  | WebhookEventUpdated
  | WebhookEventCanceled
  | WebhookGuestRegistered
  | WebhookGuestUpdated
  | WebhookTicketRegistered
  | WebhookCalendarPersonSubscribed
  | WebhookCalendarEventAdded;

export type UnwrappedWebhookEvent = WebhookEvent & {
  id: string;
  timestamp: number;
};

export { SCOPES, WEBHOOK_EVENT_TYPES } from "../webhooks/scopes";

export type { paths, components } from "./generated";
export type ListResponse<T> = SdkListResponse<T>;
