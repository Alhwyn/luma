import type { Luma } from "../../luma"; 
import { mapListResponse } from "../../core/pagination";  
import type {
  ApiTicketTypeListResponse, 
  TicketType,
  TicketTypeCreateParams,
  TicketTypeUpdateParams,
} from "../../types";

export class EventTicketTypesResource {
  constructor(private readonly luma: Luma) {} 

  list(eventId: string, params?: { include_hidden?: string }) {
    return this.luma
      .request<ApiTicketTypeListResponse>("GET", "/v1/events/ticket-types/list", {
        query: { event_id: eventId, ...params },
      })
      .then(mapListResponse);
  }

  get(_eventId: string, ticketTypeId: string) {
    return this.luma.request<TicketType>("GET", "/v1/events/ticket-types/get", {
      query: { event_ticket_type_id: ticketTypeId },
    });
  }

  create(eventId: string, body: TicketTypeCreateParams) {
    return this.luma.request<TicketType>("POST", "/v1/events/ticket-types/create", {
      body: { event_id: eventId, ...body },
    });
  }

  update(eventId: string, ticketTypeId: string, body: TicketTypeUpdateParams) {
    return this.luma.request<TicketType>("POST", "/v1/events/ticket-types/update", {
      body: { event_id: eventId, event_ticket_type_id: ticketTypeId, ...body },
    });
  }

  delete(eventId: string, ticketTypeId: string) {
    return this.luma.request<Record<string, never>>(
      "POST",
      "/v1/events/ticket-types/delete",
      {
        body: { event_id: eventId, event_ticket_type_id: ticketTypeId },
      },
    );
  }
}