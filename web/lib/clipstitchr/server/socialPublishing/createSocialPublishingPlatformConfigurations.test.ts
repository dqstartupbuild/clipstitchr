import { describe, expect, it } from "vitest";
import { createSocialPublishingPlatformConfigurations } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingPlatformConfigurations";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

function createAccount(
  id: string,
  platform: SocialPublishingSocialAccount["platform"],
): SocialPublishingSocialAccount {
  return {
    displayName: id,
    id,
    isActive: true,
    needsReconnection: false,
    platform,
    profileId: "profile_1",
    username: id,
  };
}

describe("createSocialPublishingPlatformConfigurations", () => {
  it("creates one Zernio target per selected account", () => {
    expect(
      createSocialPublishingPlatformConfigurations({
        accounts: [
          createAccount("tiktok_1", "tiktok"),
          createAccount("youtube_1", "youtube"),
        ],
        mediaKind: "video",
      }),
    ).toEqual([
      { accountId: "tiktok_1", platform: "tiktok" },
      { accountId: "youtube_1", platform: "youtube" },
    ]);
  });

  it("uses custom content only for TikTok", () => {
    expect(
      createSocialPublishingPlatformConfigurations({
        accounts: [
          createAccount("tiktok_1", "tiktok"),
          createAccount("instagram_1", "instagram"),
        ],
        mediaKind: "image",
        tiktokCaption: "Body copy",
      }),
    ).toEqual([
      {
        accountId: "tiktok_1",
        customContent: "Body copy",
        platform: "tiktok",
      },
      { accountId: "instagram_1", platform: "instagram" },
    ]);
  });

  it("sends custom media only to its matching platform", () => {
    expect(
      createSocialPublishingPlatformConfigurations({
        accounts: [
          createAccount("tiktok_1", "tiktok"),
          createAccount("instagram_1", "instagram"),
        ],
        customMediaIdsByPlatform: {
          instagram: ["https://cdn.zernio.test/instagram-slide.png"],
        },
        mediaKind: "image",
      }),
    ).toEqual([
      { accountId: "tiktok_1", platform: "tiktok" },
      {
        accountId: "instagram_1",
        customMedia: [
          {
            type: "image",
            url: "https://cdn.zernio.test/instagram-slide.png",
          },
        ],
        platform: "instagram",
      },
    ]);
  });
});
