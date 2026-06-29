import { describe, expect, test } from "bun:test";
import { mapListResponse } from "../../src/core/pagination";

describe("mapListResponse", () => {
  test("maps entries to data and snake_case pagination fields to camelCase", () => {
    const result = mapListResponse({
      entries: [{ id: "evt-1" }, { id: "evt-2" }],
      has_more: true,
      next_cursor: "cursor-abc",
    });

    expect(result).toEqual({
      data: [{ id: "evt-1" }, { id: "evt-2" }],
      hasMore: true,
      nextCursor: "cursor-abc",
    });
  });

  test("defaults hasMore to false and nextCursor to null", () => {
    const result = mapListResponse({
      entries: [],
    });

    expect(result).toEqual({
      data: [],
      hasMore: false,
      nextCursor: null,
    });
  });
});
