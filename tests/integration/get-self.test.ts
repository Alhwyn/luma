import { describe, expect, test } from "bun:test";
import { Luma } from "../../src/luma";

const apiKey = process.env.LUMA_API_KEY;

describe.skipIf(!apiKey)("integration: users.get", () => {
  test("returns the authenticated user", async () => {
    const luma = new Luma(apiKey!);
    const user = await luma.users.get();

    expect(user.id).toBeString();
    expect(user.email).toBeString();
  });
});
