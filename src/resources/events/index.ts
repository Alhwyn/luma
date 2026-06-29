import { mapListResponse } from "../../core/pagination";
import type { Luma } from "../../luma";
import type {
  ApiEventListResponse,
  Event,
  EventCreateParams,
  EventListParams,
  EventUpdateParams,
} from "../../types";
import { EventGuestsResource } from "./guests";
import { EventTicketTypesResource } from "./ticket-types";

export class EventsResource {
  readonly guests: EventGuestsResource;
  readonly ticketTypes: EventTicketTypesResource;

  constructor(private readonly luma: Luma) {
    this.guests      = new EventGuestsResource(this.luma);
    this.ticketTypes = new EventTicketTypesResource(this.luma);
  }

  get(eventId: string) {
    return this.luma.request<Event>("GET", "/v1/events/get", {
      query: { event_id: eventId },
    });
  }

  list(params?: EventListParams) {
    return this.luma
      .request<ApiEventListResponse>("GET", "/v1/calendars/events/list", {
        query: params,
      })
      .then(mapListResponse);
  }

  create(body: EventCreateParams) {
    return this.luma.request<Event>("POST", "/v1/events/create", { body });
  }

  update(eventId: string, body: EventUpdateParams) {
    return this.luma.request<Event>("POST", "/v1/events/update", {
      body: { event_id: eventId, ...body },
    });
  }
}
