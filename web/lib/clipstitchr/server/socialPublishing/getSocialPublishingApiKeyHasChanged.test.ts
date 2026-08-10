import { afterEach, describe, expect, it } from "vitest";
import { encryptSocialPublishingApiKey } from "@/lib/clipstitchr/server/socialPublishing/encryptSocialPublishingApiKey";
import { getSocialPublishingApiKeyHasChanged } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingApiKeyHasChanged";

const originalSecret = process.env.SOCIAL_PUBLISHING_API_KEY_ENCRYPTION_SECRET;

describe("getSocialPublishingApiKeyHasChanged", () => {
  afterEach(() => {
    process.env.SOCIAL_PUBLISHING_API_KEY_ENCRYPTION_SECRET = originalSecret;
  });

  it("keeps linked accounts when there is no saved key yet", () => {
    expect(getSocialPublishingApiKeyHasChanged(undefined, "pb_new_key")).toBe(false);
  });

  it("keeps linked accounts when the saved key matches", () => {
    process.env.SOCIAL_PUBLISHING_API_KEY_ENCRYPTION_SECRET = "test-secret";

    expect(
      getSocialPublishingApiKeyHasChanged(
        encryptSocialPublishingApiKey("pb_existing_key"),
        " pb_existing_key ",
      ),
    ).toBe(false);
  });

  it("clears linked accounts when the saved key changes", () => {
    process.env.SOCIAL_PUBLISHING_API_KEY_ENCRYPTION_SECRET = "test-secret";

    expect(
      getSocialPublishingApiKeyHasChanged(
        encryptSocialPublishingApiKey("pb_existing_key"),
        "pb_next_key",
      ),
    ).toBe(true);
  });

  it("clears linked accounts when the saved key cannot be read", () => {
    expect(getSocialPublishingApiKeyHasChanged("broken", "pb_next_key")).toBe(true);
  });
});
