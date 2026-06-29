import { request as httpRequest } from "./core/http"; 
import type { ClientOptions, QueryParams } from "./core/types"; 
import { CalendarResource } from "./resources/calendar"; 
import { EventsResource } from "./resources/events";  
import { UsersResource } from "./resources/users";   

export class Luma {
  readonly users: UsersResource;
  readonly calendar: CalendarResource; 
  readonly events: EventsResource;  

  constructor(
    private readonly apiKey: string,
    private readonly options: ClientOptions = {},
  ) {
    this.users = new UsersResource(this);
    this.calendar = new CalendarResource(this);
    this.events = new EventsResource(this);
  }

  request<T>(
    method: "GET" | "POST", 
    path: string,
    opts?: { query?: QueryParams; body?: unknown },
  ): Promise<T> {
    return httpRequest<T>(
      { apiKey: this.apiKey, options: this.options },
      method,
      path,
      opts,
    );
  }
}