import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { readInstagramSignedRequest } from "./readInstagramSignedRequest";

const originalSecret = process.env.INSTAGRAM_CLIENT_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.INSTAGRAM_CLIENT_SECRET;
  } else {
    process.env.INSTAGRAM_CLIENT_SECRET = originalSecret;
  }
});

describe("readInstagramSignedRequest", () => {
  it("verifies Meta's signature before returning the account", () => {
    process.env.INSTAGRAM_CLIENT_SECRET = "instagram-secret";
    const payload = Buffer.from(
      JSON.stringify({ user_id: "account_1" }),
      "utf8",
    ).toString("base64url");
    const signature = createHmac("sha256", "instagram-secret")
      .update(payload, "utf8")
      .digest("base64url");

    expect(readInstagramSignedRequest(`${signature}.${payload}`)).toEqual({
      user_id: "account_1",
    });
    expect(() =>
      readInstagramSignedRequest(`invalid.${payload}`),
    ).toThrow("verified");
  });
});
