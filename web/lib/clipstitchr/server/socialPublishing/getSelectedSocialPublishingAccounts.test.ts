import { describe, expect, it } from "vitest";
import { getSelectedSocialPublishingAccounts } from "@/lib/clipstitchr/server/socialPublishing/getSelectedSocialPublishingAccounts";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

const accounts: SocialPublishingSocialAccount[] = [
  {
    displayName: "ClipStitchr",
    id: "account_1",
    isActive: true,
    needsReconnection: false,
    platform: "tiktok",
    profileId: "profile_1",
    tiktokCanPostMore: true,
    tiktokPrivacyLevels: [
      { label: "Everyone", value: "PUBLIC_TO_EVERYONE" },
    ],
    username: "clipstitchr",
  },
  {
    displayName: "ClipStitchr IG",
    id: "account_2",
    isActive: true,
    needsReconnection: false,
    platform: "instagram",
    profileId: "profile_1",
    username: "clipstitchr.ig",
  },
];

describe("getSelectedSocialPublishingAccounts", () => {
  it("returns matching connected accounts", () => {
    expect(getSelectedSocialPublishingAccounts(accounts, ["account_2"])).toEqual([
      accounts[1],
    ]);
  });

  it("throws when a requested account is unavailable", () => {
    expect(() =>
      getSelectedSocialPublishingAccounts(accounts, ["account_3"]),
    ).toThrow(
      "Choose connected accounts before scheduling.",
    );
  });
});
