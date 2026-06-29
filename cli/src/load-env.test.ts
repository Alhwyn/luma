import { describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEnvFile, parseEnvContent } from "./load-env";

describe("parseEnvContent", () => {
  test("parses key=value pairs", () => {
    expect(parseEnvContent("LUMA_API_KEY=abc123\n")).toEqual({
      LUMA_API_KEY: "abc123",
    });
  });

  test("skips comments and blank lines", () => {
    expect(
      parseEnvContent("# comment\n\nFOO=bar\n# another\nBAZ=qux\n"),
    ).toEqual({
      FOO: "bar",
      BAZ: "qux",
    });
  });

  test("strips surrounding quotes", () => {
    expect(parseEnvContent('LUMA_API_KEY="quoted"\n')).toEqual({
      LUMA_API_KEY: "quoted",
    });
  });
});

describe("loadEnvFile", () => {
  test("loads .env from cwd without overriding existing env", () => {
    const dir = mkdtempSync(join(tmpdir(), "luma-cli-env-"));
    writeFileSync(join(dir, ".env"), "LUMA_API_KEY=from-file\nOTHER=value\n");

    const originalKey = process.env.LUMA_API_KEY;
    const originalOther = process.env.OTHER;
    process.env.LUMA_API_KEY = "from-env";

    loadEnvFile(dir);

    expect(process.env.LUMA_API_KEY).toBe("from-env");
    expect(process.env.OTHER).toBe("value");

    if (originalKey !== undefined) {
      process.env.LUMA_API_KEY = originalKey;
    } else {
      delete process.env.LUMA_API_KEY;
    }

    if (originalOther !== undefined) {
      process.env.OTHER = originalOther;
    } else {
      delete process.env.OTHER;
    }

    rmSync(dir, { recursive: true });
  });

  test("sets missing vars from .env", () => {
    const dir = mkdtempSync(join(tmpdir(), "luma-cli-env-"));
    writeFileSync(join(dir, ".env"), "LUMA_API_KEY=from-file\n");

    const original = process.env.LUMA_API_KEY;
    delete process.env.LUMA_API_KEY;

    loadEnvFile(dir);
    expect(process.env.LUMA_API_KEY).toBe("from-file");

    if (original !== undefined) {
      process.env.LUMA_API_KEY = original;
    } else {
      delete process.env.LUMA_API_KEY;
    }

    rmSync(dir, { recursive: true });
  });
});
