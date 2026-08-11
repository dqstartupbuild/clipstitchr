import { filterSupportedSocialPublishingAccounts } from "@/lib/clipstitchr/server/socialPublishing/filterSupportedSocialPublishingAccounts";
import { getSocialPublishingTikTokCreatorInfo } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingTikTokCreatorInfo";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

type ListSocialPublishingSocialAccountsResponse = {
  accounts: {
    _id: unknown;
    displayName?: unknown;
    enabled?: unknown;
    isActive?: unknown;
    needsReconnection?: unknown;
    platform: unknown;
    profileId?: unknown;
    username?: unknown;
  }[];
};

export async function listSocialPublishingSocialAccounts(
  apiKey: string,
): Promise<
  SocialPublishingSocialAccount[]
> {
  const response = await requestSocialPublishing<ListSocialPublishingSocialAccountsResponse>(
    "/v1/accounts",
    {
      apiKey,
    },
  );

  const accounts = filterSupportedSocialPublishingAccounts(response.accounts);

  return await Promise.all(
    accounts.map(async (account) => {
      if (account.platform !== "tiktok" || !account.isActive) {
        return account;
      }

      try {
        const creatorInfo = await getSocialPublishingTikTokCreatorInfo(
          apiKey,
          account.id,
        );

        return {
          ...account,
          tiktokCanPostMore: creatorInfo.creator.canPostMore,
          tiktokPrivacyLevels: creatorInfo.privacyLevels,
        };
      } catch {
        return {
          ...account,
          tiktokPrivacyLevels: [],
        };
      }
    }),
  );
}
