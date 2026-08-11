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
        caption: "Launch",
        mediaKind: "video",
        title: "Launch title",
      }),
    ).toEqual([
      { accountId: "tiktok_1", platform: "tiktok" },
      {
        accountId: "youtube_1",
        platform: "youtube",
        platformSpecificData: { title: "Launch title" },
      },
    ]);
  });

  it("keeps the full caption on non-TikTok targets when TikTok uses a photo title", () => {
    expect(
      createSocialPublishingPlatformConfigurations({
        accounts: [
          createAccount("tiktok_1", "tiktok"),
          createAccount("instagram_1", "instagram"),
        ],
        caption: "Photo title\n\nBody copy",
        isTikTokPhotoPost: true,
        mediaKind: "image",
        title: "Photo title",
      }),
    ).toEqual([
      {
        accountId: "tiktok_1",
        platform: "tiktok",
      },
      {
        accountId: "instagram_1",
        customContent: "Photo title\n\nBody copy",
        platform: "instagram",
      },
    ]);
  });

  it("sends custom media only to its matching platform", () => {
    expect(
      createSocialPublishingPlatformConfigurations({
        accounts: [
          createAccount("tiktok_1", "tiktok"),
          createAccount("instagram_1", "instagram"),
        ],
        caption: "Launch",
        customMediaIdsByPlatform: {
          instagram: ["https://cdn.zernio.test/instagram-slide.png"],
        },
        mediaKind: "image",
        title: "Launch title",
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
