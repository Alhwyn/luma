import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs, requireApiKey, usage } from "./parse";
import {
  captureConsole,
  jsonResponse,
  trackFetch,
} from "./test-helpers";

describe("parseArgs", () => {
  test("returns help for no args", () => {
    expect(parseArgs(["node", "luma"])).toEqual({ kind: "help" });
  });

  test("returns help for --help", () => {
    expect(parseArgs(["node", "luma", "--help"])).toEqual({ kind: "help" });
  });

  test("parses users get", () => {
    expect(parseArgs(["node", "luma", "users", "get"])).toEqual({
      kind: "users-get",
    });
  });

  test("parses events list", () => {
    expect(parseArgs(["node", "luma", "events", "list"])).toEqual({
      kind: "events-list",
      limit: 20,
    });
  });

  test("parses events list --limit", () => {
    expect(parseArgs(["node", "luma", "events", "list", "--limit", "50"])).toEqual({
      kind: "events-list",
      limit: 50,
    });
  });

  test("rejects events list --limit without value", () => {
    expect(() => parseArgs(["node", "luma", "events", "list", "--limit"])).toThrow(
      "Missing value for --limit",
    );
  });

  test("rejects invalid --limit", () => {
    expect(() =>
      parseArgs(["node", "luma", "events", "list", "--limit", "0"]),
    ).toThrow("Invalid --limit value");
  });

  test("rejects whoami as unknown", () => {
    expect(() => parseArgs(["node", "luma", "whoami"])).toThrow(
      "Unknown command",
    );
  });

  test("rejects extra args on users get", () => {
    expect(() =>
      parseArgs(["node", "luma", "users", "get", "extra"]),
    ).toThrow("Too many arguments");
  });

  test("rejects extra args on events list", () => {
    expect(() =>
      parseArgs(["node", "luma", "events", "list", "junk"]),
    ).toThrow("Too many arguments");
  });

  test("rejects incomplete commands", () => {
    expect(() => parseArgs(["node", "luma", "users"])).toThrow(
      "Unknown command",
    );
    expect(() => parseArgs(["node", "luma", "events"])).toThrow(
      "Unknown command",
    );
  });

  test("rejects help mixed with commands", () => {
    expect(() => parseArgs(["node", "luma", "users", "get", "--help"])).toThrow(
      "Unexpected option",
    );
    expect(() => parseArgs(["node", "luma", "--help", "extra"])).toThrow(
      "Unexpected option",
    );
  });

  test("rejects whoami with trailing junk", () => {
    expect(() => parseArgs(["node", "luma", "whoami", "extra", "junk"])).toThrow(
      "Unknown command",
    );
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
    const consoleOutput = captureConsole();
    const { run } = await import("./index");
    const code = await run(["node", "luma", "--help"]);

    expect(code).toBe(0);
    expect(consoleOutput.logs).toHaveLength(1);
    expect(consoleOutput.logs[0]).toContain("luma users get");
    consoleOutput.restore();
  });

  test("exits with error when API key missing for users get", async () => {
    const dir = mkdtempSync(join(tmpdir(), "luma-cli-missing-key-"));
    const originalCwd = process.cwd();
    const original = process.env.LUMA_API_KEY;
    delete process.env.LUMA_API_KEY;

    process.chdir(dir);

    const { fetch, calls } = trackFetch(() =>
      jsonResponse({ id: "usr-1", email: "nope@example.com" }),
    );
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetch;

    const consoleOutput = captureConsole();
    const { run } = await import("./index");
    const code = await run(["node", "luma", "users", "get"]);

    expect(code).toBe(1);
    expect(calls).toHaveLength(0);
    expect(consoleOutput.logs).toHaveLength(0);
    expect(consoleOutput.errors[0]).toContain("Missing LUMA_API_KEY");

    consoleOutput.restore();
    globalThis.fetch = originalFetch;
    process.chdir(originalCwd);
    rmSync(dir, { recursive: true });

    if (original !== undefined) {
      process.env.LUMA_API_KEY = original;
    }
  });

  test("loads LUMA_API_KEY from .env when env is unset", async () => {
    const dir = mkdtempSync(join(tmpdir(), "luma-cli-run-"));
    writeFileSync(join(dir, ".env"), "LUMA_API_KEY=from-file\n");
    const originalCwd = process.cwd();
    const original = process.env.LUMA_API_KEY;
    delete process.env.LUMA_API_KEY;

    process.chdir(dir);

    const { fetch, calls } = trackFetch(() =>
      jsonResponse({ id: "usr-1", email: "jane@example.com" }),
    );
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetch;

    const consoleOutput = captureConsole();
    const { run } = await import("./index");
    const code = await run(["node", "luma", "users", "get"]);

    expect(code).toBe(0);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("https://public-api.luma.com/v1/users/get-self");
    expect(calls[0]?.init?.headers?.get("x-luma-api-key")).toBe("from-file");
    expect(consoleOutput.logs).toEqual(["jane@example.com (usr-1)"]);

    consoleOutput.restore();
    globalThis.fetch = originalFetch;
    process.chdir(originalCwd);
    rmSync(dir, { recursive: true });

    if (original !== undefined) {
      process.env.LUMA_API_KEY = original;
    } else {
      delete process.env.LUMA_API_KEY;
    }
  });

  test("events list uses pagination_limit and prints summary", async () => {
    const original = process.env.LUMA_API_KEY;
    process.env.LUMA_API_KEY = "test-key";

    const { fetch, calls } = trackFetch(() =>
      jsonResponse({
        entries: [
          { id: "evt-1", name: "Demo", platform: "luma" },
          { id: "evt-2", name: "Meetup", platform: "luma" },
        ],
        has_more: true,
      }),
    );
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetch;

    const consoleOutput = captureConsole();
    const { run } = await import("./index");
    const code = await run(["node", "luma", "events", "list", "--limit", "2"]);

    expect(code).toBe(0);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(
      "https://public-api.luma.com/v1/calendars/events/list?pagination_limit=2",
    );
    expect(calls[0]?.init?.headers?.get("x-luma-api-key")).toBe("test-key");
    expect(consoleOutput.logs[0]).toContain("Showing 2 events (more available)");
    expect(consoleOutput.logs[0]).toContain("ID\tNAME");
    expect(consoleOutput.logs[0]).toContain("evt-1\tDemo");
    expect(consoleOutput.logs[0]).toContain("evt-2\tMeetup");

    consoleOutput.restore();
    globalThis.fetch = originalFetch;
    if (original !== undefined) {
      process.env.LUMA_API_KEY = original;
    } else {
      delete process.env.LUMA_API_KEY;
    }
  });

  test("users get prints user and calls the API", async () => {
    const original = process.env.LUMA_API_KEY;
    process.env.LUMA_API_KEY = "test-key";

    const { fetch, calls } = trackFetch(() =>
      jsonResponse({ id: "usr-1", email: "jane@example.com" }),
    );
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetch;

    const consoleOutput = captureConsole();
    const { run } = await import("./index");
    const code = await run(["node", "luma", "users", "get"]);

    expect(code).toBe(0);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe("https://public-api.luma.com/v1/users/get-self");
    expect(calls[0]?.init?.method ?? "GET").toBe("GET");
    expect(calls[0]?.init?.headers?.get("x-luma-api-key")).toBe("test-key");
    expect(consoleOutput.logs).toEqual(["jane@example.com (usr-1)"]);
    expect(consoleOutput.errors).toHaveLength(0);

    consoleOutput.restore();
    globalThis.fetch = originalFetch;
    if (original !== undefined) {
      process.env.LUMA_API_KEY = original;
    } else {
      delete process.env.LUMA_API_KEY;
    }
  });
});
