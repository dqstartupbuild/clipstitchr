import { filterSupportedSocialPublishingAccounts } from "@/lib/clipstitchr/server/socialPublishing/filterSupportedSocialPublishingAccounts";
import { requestSocialPublishing } from "@/lib/clipstitchr/server/socialPublishing/requestSocialPublishing";
import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

type ListSocialPublishingAnalyticsAccountsResponse = {
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

export async function listSocialPublishingAnalyticsAccounts(
  apiKey: string,
): Promise<SocialPublishingSocialAccount[]> {
  const response =
    await requestSocialPublishing<ListSocialPublishingAnalyticsAccountsResponse>(
      "/v1/accounts",
      { apiKey },
    );

  return filterSupportedSocialPublishingAccounts(response.accounts);
}
