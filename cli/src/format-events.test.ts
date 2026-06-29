import { describe, expect, test } from "bun:test";
import { formatEventsList } from "./format-events";

describe("formatEventsList", () => {
  test("returns message for empty list", () => {
    expect(formatEventsList([], { hasMore: false })).toBe("No events found.");
  });

  test("formats events with header and exact count", () => {
    const output = formatEventsList(
      [
        { id: "evt-1", name: "Demo" },
        { id: "evt-2", name: "Meetup" },
      ],
      { hasMore: false },
    );

    expect(output).toBe(
      "Showing 2 of 2 events\n\nID\tNAME\nevt-1\tDemo\nevt-2\tMeetup",
    );
  });

  test("notes when more events are available", () => {
    const output = formatEventsList(
      [{ id: "evt-1", name: "Demo" }],
      { hasMore: true },
    );

    expect(output).toContain("Showing 1 events (more available)");
  });
});
