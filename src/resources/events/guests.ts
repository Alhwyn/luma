import type { Luma } from "../../luma"; 
import { mapListResponse } from "../../core/pagination"; 
import type {
  ApiGuestListResponse,
  Guest,
  GuestAddParams,
  GuestListParams,
  GuestUpdateStatusParams,
} from "../../types";

export class EventGuestsResource {
  constructor(private readonly luma: Luma) {}

  list(eventId: string, params?: GuestListParams) {
    return this.luma
      .request<ApiGuestListResponse>("GET", "/v1/events/guests/list", {
        query: { event_id: eventId, ...params },
      })
      .then(mapListResponse);
  }

  get(eventId: string, guestId: string) {
    return this.luma.request<Guest>("GET", "/v1/events/guests/get", {
      query: { event_id: eventId, id: guestId },
    })
  }

  add(eventId: string, body: GuestAddParams) {
    return this.luma.request<Record<string, never>>("POST", "/v1/events/guests/add", {
      body: { event_id: eventId, ...body },
    });
  }

  updateStatus(
    eventId: string,
    guestId: string,
    body: GuestUpdateStatusParams
  ) {
    return this.luma.request<Record<string, never>>(
      "POST",
      "/v1/events/guests/update-status",
      {
        body: { event_id: eventId, guest_id: guestId, ...body },
      },
    );
  }
}