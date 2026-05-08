import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getReplicateToken } from "@/lib/clipstitchr/server/getReplicateToken";

const originalReplicateApiToken = process.env.REPLICATE_API_TOKEN;
const originalReplicateKey = process.env.REPLICATE_KEY;

describe("getReplicateToken", () => {
  beforeEach(() => {
    delete process.env.REPLICATE_API_TOKEN;
    delete process.env.REPLICATE_KEY;
  });

  afterEach(() => {
    if (originalReplicateApiToken === undefined) {
      delete process.env.REPLICATE_API_TOKEN;
    } else {
      process.env.REPLICATE_API_TOKEN = originalReplicateApiToken;
    }

    if (originalReplicateKey === undefined) {
      delete process.env.REPLICATE_KEY;
    } else {
      process.env.REPLICATE_KEY = originalReplicateKey;
    }
  });

  it("uses a request token before server tokens", () => {
    process.env.REPLICATE_API_TOKEN = "server-token";

    expect(getReplicateToken(" request-token ")).toBe("request-token");
  });

  it("falls back to REPLICATE_API_TOKEN", () => {
    process.env.REPLICATE_API_TOKEN = "server-api-token";

    expect(getReplicateToken()).toBe("server-api-token");
  });

  it("falls back to REPLICATE_KEY", () => {
    process.env.REPLICATE_KEY = "server-key";

    expect(getReplicateToken()).toBe("server-key");
  });

  it("returns null without a request or server token", () => {
    expect(getReplicateToken()).toBeNull();
  });
});
