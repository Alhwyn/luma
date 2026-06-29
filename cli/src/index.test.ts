import { describe, expect, test } from "bun:test";
import { parseArgs, requireApiKey, usage } from "./parse";

describe("parseArgs", () => {
  test("returns help for no args", () => {
    expect(parseArgs(["node", "luma"])).toEqual({ kind: "help" });
  });

  test("returns help for --help", () => {
    expect(parseArgs(["node", "luma", "--help"])).toEqual({ kind: "help" });
  });

  test("parses whoami", () => {
    expect(parseArgs(["node", "luma", "whoami"])).toEqual({ kind: "whoami" });
  });

  test("parses events list", () => {
    expect(parseArgs(["node", "luma", "events", "list"])).toEqual({
      kind: "events",
    });
  });

  test("throws for unknown command", () => {
    expect(() => parseArgs(["node", "luma", "unknown"])).toThrow(
      "Unknown command",
    );
    expect(() => parseArgs(["node", "luma", "unknown"])).toThrow(usage);
  });
});

describe("requireApiKey", () => {
  test("returns key when set", () => {
    expect(requireApiKey("test-key")).toBe("test-key");
  });

  test("throws when missing", () => {
    expect(() => requireApiKey(undefined)).toThrow("Missing LUMA_API_KEY");
  });

  test("throws when empty", () => {
    expect(() => requireApiKey("")).toThrow("Missing LUMA_API_KEY");
  });
});

describe("run", () => {
  test("prints help without API key", async () => {
    const { run } = await import("./index");
    const code = await run(["node", "luma", "--help"]);
    expect(code).toBe(0);
  });

  test("exits with error when API key missing for whoami", async () => {
    const original = process.env.LUMA_API_KEY;
    delete process.env.LUMA_API_KEY;

    const { run } = await import("./index");
    const code = await run(["node", "luma", "whoami"]);
    expect(code).toBe(1);

    if (original !== undefined) {
      process.env.LUMA_API_KEY = original;
    }
  });

  test("whoami calls users.get with mocked fetch", async () => {
    const original = process.env.LUMA_API_KEY;
    process.env.LUMA_API_KEY = "test-key";

    const { run } = await import("./index");

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          id: "usr-1",
          email: "jane@example.com",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )) as typeof fetch;

    const code = await run(["node", "luma", "whoami"]);
    expect(code).toBe(0);

    globalThis.fetch = originalFetch;
    if (original !== undefined) {
      process.env.LUMA_API_KEY = original;
    } else {
      delete process.env.LUMA_API_KEY;
    }
  });
});
