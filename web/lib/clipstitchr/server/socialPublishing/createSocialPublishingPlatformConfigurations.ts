import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

type CreateSocialPublishingPlatformConfigurationsOptions = {
  accounts: SocialPublishingSocialAccount[];
  customMediaIdsByPlatform?: Partial<Record<SocialPublishingPlatform, string[]>>;
  mediaKind: SocialPublishingMediaKind;
  tiktokCaption?: string;
};

export function createSocialPublishingPlatformConfigurations({
  accounts,
  customMediaIdsByPlatform = {},
  mediaKind,
  tiktokCaption,
}: CreateSocialPublishingPlatformConfigurationsOptions) {
  return accounts.map((account) => {
    const customMediaIds = customMediaIdsByPlatform[account.platform] ?? [];

    return {
      accountId: account.id,
      ...(account.platform === "tiktok" && tiktokCaption
        ? { customContent: tiktokCaption }
        : {}),
      ...(customMediaIds.length
        ? {
            customMedia: customMediaIds.map((url) => ({
              type: mediaKind,
              url,
            })),
          }
        : {}),
      platform: account.platform,
    };
  });
}
