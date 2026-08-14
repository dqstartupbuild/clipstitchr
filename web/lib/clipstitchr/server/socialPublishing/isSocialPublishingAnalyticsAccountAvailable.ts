import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

export function isSocialPublishingAnalyticsAccountAvailable(
  account: SocialPublishingSocialAccount,
) {
  return account.isActive && !account.needsReconnection;
}
