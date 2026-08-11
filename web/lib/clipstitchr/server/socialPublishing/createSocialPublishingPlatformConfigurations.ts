import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";
import type { SocialPublishingPlatform } from "@/lib/clipstitchr/types/SocialPublishingPlatform";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

type CreateSocialPublishingPlatformConfigurationsOptions = {
  accounts: SocialPublishingSocialAccount[];
  caption: string;
  customMediaIdsByPlatform?: Partial<Record<SocialPublishingPlatform, string[]>>;
  isTikTokPhotoPost?: boolean;
  mediaKind: SocialPublishingMediaKind;
  title: string;
};

export function createSocialPublishingPlatformConfigurations({
  accounts,
  caption,
  customMediaIdsByPlatform = {},
  isTikTokPhotoPost = false,
  mediaKind,
  title,
}: CreateSocialPublishingPlatformConfigurationsOptions) {
  return accounts.map((account) => {
    const customMediaIds = customMediaIdsByPlatform[account.platform] ?? [];

    return {
      accountId: account.id,
      ...(isTikTokPhotoPost && account.platform !== "tiktok"
        ? { customContent: caption }
        : {}),
      ...(customMediaIds.length
        ? {
            customMedia: customMediaIds.map((url) => ({
              type: mediaKind,
              url,
            })),
          }
        : {}),
      ...(account.platform === "youtube"
        ? { platformSpecificData: { title } }
        : {}),
      platform: account.platform,
    };
  });
}
