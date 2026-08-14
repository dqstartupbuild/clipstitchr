import { describe, expect, it } from "vitest";
import { getSocialPublishingAnalyticsQueryScopes } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingAnalyticsQueryScopes";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

function createAccount(
  id: string,
  profileId: string,
): SocialPublishingSocialAccount {
  return {
    displayName: id,
    id,
    isActive: true,
    needsReconnection: false,
    platform: "instagram",
    profileId,
    username: id,
  };
}

describe("getSocialPublishingAnalyticsQueryScopes", () => {
  it("uses one profile query when every account in that profile is selected", () => {
    expect(
      getSocialPublishingAnalyticsQueryScopes(
        [createAccount("one", "profile_1"), createAccount("two", "profile_1")],
        ["one", "two"],
      ),
    ).toEqual([{ profileId: "profile_1" }]);
  });

  it("uses account queries for a selected subset and ignores unavailable accounts", () => {
    const unavailable = {
      ...createAccount("three", "profile_2"),
      needsReconnection: true,
    };

    expect(
      getSocialPublishingAnalyticsQueryScopes(
        [
          createAccount("one", "profile_1"),
          createAccount("two", "profile_1"),
          unavailable,
        ],
        ["one", "three"],
      ),
    ).toEqual([{ accountId: "one" }]);
  });
});
