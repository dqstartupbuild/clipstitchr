import { isSocialPublishingPlatform } from "@/lib/clipstitchr/server/socialPublishing/isSocialPublishingPlatform";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

type RawSocialPublishingSocialAccount = {
  _id: unknown;
  displayName?: unknown;
  enabled?: unknown;
  isActive?: unknown;
  needsReconnection?: unknown;
  platform: unknown;
  profileId?: unknown;
  username?: unknown;
};

export function filterSupportedSocialPublishingAccounts(
  accounts: RawSocialPublishingSocialAccount[],
): SocialPublishingSocialAccount[] {
  return accounts.flatMap((account) => {
    if (
      typeof account._id !== "string" ||
      account.enabled === false ||
      !isSocialPublishingPlatform(account.platform)
    ) {
      return [];
    }

    const profileId =
      typeof account.profileId === "string"
        ? account.profileId
        : typeof account.profileId === "object" && account.profileId !== null
          ? (account.profileId as { _id?: unknown })._id
          : null;

    if (typeof profileId !== "string" || !profileId) {
      return [];
    }

    const username =
      typeof account.username === "string" && account.username.trim()
        ? account.username.trim()
        : typeof account.displayName === "string"
          ? account.displayName.trim()
          : "Connected account";

    return [{
      displayName:
        typeof account.displayName === "string" && account.displayName.trim()
          ? account.displayName.trim()
          : username,
      id: account._id,
      isActive: account.isActive !== false,
      needsReconnection: account.needsReconnection === true,
      platform: account.platform,
      profileId,
      username,
    }];
  });
}
