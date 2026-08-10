import { describe, expect, it } from "vitest";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import { getSharedSocialPublishingTikTokPrivacyLevels } from "@/lib/clipstitchr/utils/getSharedSocialPublishingTikTokPrivacyLevels";

function createTikTokAccount(
  id: string,
  privacyValues: string[],
): SocialPublishingSocialAccount {
  return {
    displayName: id,
    id,
    isActive: true,
    needsReconnection: false,
    platform: "tiktok",
    profileId: "profile_1",
    tiktokCanPostMore: true,
    tiktokPrivacyLevels: privacyValues.map((value) => ({ label: value, value })),
    username: id,
  };
}

describe("getSharedSocialPublishingTikTokPrivacyLevels", () => {
  it("keeps only privacy choices available to every selected TikTok account", () => {
    expect(
      getSharedSocialPublishingTikTokPrivacyLevels([
        createTikTokAccount("one", ["PUBLIC_TO_EVERYONE", "SELF_ONLY"]),
        createTikTokAccount("two", ["SELF_ONLY"]),
      ]),
    ).toEqual([{ label: "SELF_ONLY", value: "SELF_ONLY" }]);
  });

  it("ignores selected non-TikTok accounts", () => {
    const instagram: SocialPublishingSocialAccount = {
      displayName: "Instagram",
      id: "instagram_1",
      isActive: true,
      needsReconnection: false,
      platform: "instagram",
      profileId: "profile_1",
      username: "instagram",
    };

    expect(
      getSharedSocialPublishingTikTokPrivacyLevels([instagram]),
    ).toEqual([]);
  });
});
