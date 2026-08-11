import { describe, expect, it } from "vitest";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import { isSocialPublishingAccountAvailable } from "@/lib/clipstitchr/utils/isSocialPublishingAccountAvailable";

function createAccount(
  overrides: Partial<SocialPublishingSocialAccount> = {},
): SocialPublishingSocialAccount {
  return {
    displayName: "Creator",
    id: "account_1",
    isActive: true,
    needsReconnection: false,
    platform: "instagram",
    profileId: "profile_1",
    username: "creator",
    ...overrides,
  };
}

describe("isSocialPublishingAccountAvailable", () => {
  it("accepts an active connected account", () => {
    expect(isSocialPublishingAccountAvailable(createAccount())).toBe(true);
  });

  it.each([
    createAccount({ isActive: false }),
    createAccount({ needsReconnection: true }),
    createAccount({
      platform: "tiktok",
      tiktokCanPostMore: false,
      tiktokPrivacyLevels: [{ label: "Everyone", value: "PUBLIC_TO_EVERYONE" }],
    }),
    createAccount({ platform: "tiktok", tiktokPrivacyLevels: [] }),
  ])("rejects an unavailable account", (account) => {
    expect(isSocialPublishingAccountAvailable(account)).toBe(false);
  });
});
