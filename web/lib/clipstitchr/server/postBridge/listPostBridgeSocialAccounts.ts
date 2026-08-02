import { createSupportedPostBridgePlatformQuery } from "@/lib/clipstitchr/server/postBridge/createSupportedPostBridgePlatformQuery";
import { filterSupportedPostBridgeAccounts } from "@/lib/clipstitchr/server/postBridge/filterSupportedPostBridgeAccounts";
import { requestPostBridge } from "@/lib/clipstitchr/server/postBridge/requestPostBridge";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

type ListPostBridgeSocialAccountsResponse = {
  data: {
    id: number;
    platform: unknown;
    username: string;
  }[];
};

export async function listPostBridgeSocialAccounts(
  apiKey: string,
): Promise<
  PostBridgeSocialAccount[]
> {
  const response = await requestPostBridge<ListPostBridgeSocialAccountsResponse>(
    "/v1/social-accounts",
    {
      apiKey,
      query: createSupportedPostBridgePlatformQuery(),
    },
  );

  return filterSupportedPostBridgeAccounts(response.data);
}
