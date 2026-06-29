import type { Luma } from "../luma";  
import type { Calendar, CalendarUpdateParams } from "../types";   

export class CalendarResource {
  constructor(private readonly luma: Luma) {}

  get() {
    return this.luma.request<Calendar>("GET", "/v1/calendars/get");
  }

  update(calendarId: string, params: CalendarUpdateParams) {
    return this.luma.request<Calendar>("POST", "/v1/calendars/update", {
      body: { calendar_id: calendarId, ...params },
    });
  }
}