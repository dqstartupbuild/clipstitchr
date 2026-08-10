import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

export function getSharedSocialPublishingTikTokPrivacyLevels(
  accounts: SocialPublishingSocialAccount[],
) {
  const tiktokAccounts = accounts.filter(
    (account) => account.platform === "tiktok",
  );

  if (!tiktokAccounts.length) {
    return [];
  }

  const [firstAccount, ...remainingAccounts] = tiktokAccounts;

  return (firstAccount.tiktokPrivacyLevels ?? []).filter((privacyLevel) =>
    remainingAccounts.every((account) =>
      account.tiktokPrivacyLevels?.some(
        (candidate) => candidate.value === privacyLevel.value,
      ),
    ),
  );
}
