import { afterEach, describe, expect, it } from "vitest";
import { decryptPostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/decryptPostBridgeApiKey";
import { encryptPostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/encryptPostBridgeApiKey";

const originalSecret = process.env.POST_BRIDGE_API_KEY_ENCRYPTION_SECRET;

describe("Post Bridge API key encryption", () => {
  afterEach(() => {
    process.env.POST_BRIDGE_API_KEY_ENCRYPTION_SECRET = originalSecret;
  });

  it("round trips a saved API key without storing it directly", () => {
    process.env.POST_BRIDGE_API_KEY_ENCRYPTION_SECRET = "test-secret";

    const encrypted = encryptPostBridgeApiKey(" pb_test_key ");

    expect(encrypted).not.toContain("pb_test_key");
    expect(decryptPostBridgeApiKey(encrypted)).toBe("pb_test_key");
  });

  it("rejects unreadable saved values", () => {
    process.env.POST_BRIDGE_API_KEY_ENCRYPTION_SECRET = "test-secret";

    expect(() => decryptPostBridgeApiKey("broken")).toThrow(
      "Saved Post Bridge key is not readable.",
    );
  });
});
