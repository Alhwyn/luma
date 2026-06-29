import type { Luma } from "../../luma";
import { EventGuestsResource } from "./guests";
import { EventTicketTypesResource } from "./ticket-types";

export class EventsResource {
  readonly guests: EventGuestsResource;
  readonly ticketTypes: EventTicketTypesResource;

  constructor(private readonly luma: Luma) {
    this.guests = new EventGuestsResource(this.luma);
    this.ticketTypes = new EventTicketTypesResource(this.luma);
  }
}
