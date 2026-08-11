import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

export function isSocialPublishingAccountAvailable(
  account: SocialPublishingSocialAccount,
) {
  return (
    account.isActive &&
    !account.needsReconnection &&
    account.tiktokCanPostMore !== false &&
    (account.platform !== "tiktok" ||
      Boolean(account.tiktokPrivacyLevels?.length))
  );
}
