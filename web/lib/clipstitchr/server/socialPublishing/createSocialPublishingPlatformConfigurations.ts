import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

type CreateSocialPublishingPlatformConfigurationsOptions = {
  accounts: SocialPublishingSocialAccount[];
  tiktokCaption?: string;
};

export function createSocialPublishingPlatformConfigurations({
  accounts,
  tiktokCaption,
}: CreateSocialPublishingPlatformConfigurationsOptions) {
  return accounts.map((account) => ({
    accountId: account.id,
    ...(account.platform === "tiktok" && tiktokCaption
      ? { customContent: tiktokCaption }
      : {}),
    platform: account.platform,
  }));
}
