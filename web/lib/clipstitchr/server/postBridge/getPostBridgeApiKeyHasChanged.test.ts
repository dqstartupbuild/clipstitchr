import { afterEach, describe, expect, it } from "vitest";
import { encryptPostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/encryptPostBridgeApiKey";
import { getPostBridgeApiKeyHasChanged } from "@/lib/clipstitchr/server/postBridge/getPostBridgeApiKeyHasChanged";

const originalSecret = process.env.POST_BRIDGE_API_KEY_ENCRYPTION_SECRET;

describe("getPostBridgeApiKeyHasChanged", () => {
  afterEach(() => {
    process.env.POST_BRIDGE_API_KEY_ENCRYPTION_SECRET = originalSecret;
  });

  it("keeps linked accounts when there is no saved key yet", () => {
    expect(getPostBridgeApiKeyHasChanged(undefined, "pb_new_key")).toBe(false);
  });

  it("keeps linked accounts when the saved key matches", () => {
    process.env.POST_BRIDGE_API_KEY_ENCRYPTION_SECRET = "test-secret";

    expect(
      getPostBridgeApiKeyHasChanged(
        encryptPostBridgeApiKey("pb_existing_key"),
        " pb_existing_key ",
      ),
    ).toBe(false);
  });

  it("clears linked accounts when the saved key changes", () => {
    process.env.POST_BRIDGE_API_KEY_ENCRYPTION_SECRET = "test-secret";

    expect(
      getPostBridgeApiKeyHasChanged(
        encryptPostBridgeApiKey("pb_existing_key"),
        "pb_next_key",
      ),
    ).toBe(true);
  });

  it("clears linked accounts when the saved key cannot be read", () => {
    expect(getPostBridgeApiKeyHasChanged("broken", "pb_next_key")).toBe(true);
  });
});
