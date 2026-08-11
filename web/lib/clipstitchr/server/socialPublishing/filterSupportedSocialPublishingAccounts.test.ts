import { describe, expect, it } from "vitest";
import { filterSupportedSocialPublishingAccounts } from "@/lib/clipstitchr/server/socialPublishing/filterSupportedSocialPublishingAccounts";

describe("filterSupportedSocialPublishingAccounts", () => {
  it("normalizes supported Zernio accounts with a profile", () => {
    expect(
      filterSupportedSocialPublishingAccounts([
        {
          _id: "tiktok_1",
          isActive: true,
          platform: "tiktok",
          profileId: "profile_1",
          username: "clipstitchr",
        },
        {
          _id: "twitter_1",
          platform: "twitter",
          profileId: "profile_1",
          username: "clipstitchr",
        },
        {
          _id: "instagram_1",
          displayName: "ClipStitchr IG",
          needsReconnection: true,
          platform: "instagram",
          profileId: { _id: "profile_1" },
          username: "clipstitchr.ig",
        },
        {
          _id: "missing_profile",
          platform: "youtube",
          username: "clipstitchr shorts",
        },
        {
          _id: "disabled_instagram",
          enabled: false,
          isActive: true,
          platform: "instagram",
          profileId: "profile_1",
          username: "hidden.side.effect",
        },
      ]),
    ).toEqual([
      {
        displayName: "clipstitchr",
        id: "tiktok_1",
        isActive: true,
        needsReconnection: false,
        platform: "tiktok",
        profileId: "profile_1",
        username: "clipstitchr",
      },
      {
        displayName: "ClipStitchr IG",
        id: "instagram_1",
        isActive: true,
        needsReconnection: true,
        platform: "instagram",
        profileId: "profile_1",
        username: "clipstitchr.ig",
      },
    ]);
  });
});
