import { describe, expect, it } from "vitest";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import { getAvailableSocialPublishingAccountIds } from "@/lib/clipstitchr/utils/getAvailableSocialPublishingAccountIds";

function createAccount(
  id: string,
  overrides: Partial<SocialPublishingSocialAccount> = {},
): SocialPublishingSocialAccount {
  return {
    displayName: id,
    id,
    isActive: true,
    needsReconnection: false,
    platform: "instagram",
    profileId: "profile_1",
    username: id,
    ...overrides,
  };
}

describe("getAvailableSocialPublishingAccountIds", () => {
  it("keeps only unique saved defaults that can publish", () => {
    expect(
      getAvailableSocialPublishingAccountIds(
        [
          createAccount("active"),
          createAccount("reconnect", { needsReconnection: true }),
        ],
        ["active", "reconnect", "missing", "active"],
      ),
    ).toEqual(["active"]);
  });
});
