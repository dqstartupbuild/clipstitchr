import { isPostBridgePlatform } from "@/lib/clipstitchr/server/postBridge/isPostBridgePlatform";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

type RawPostBridgeSocialAccount = {
  id: number;
  platform: unknown;
  username: string;
};

export function filterSupportedPostBridgeAccounts(
  accounts: RawPostBridgeSocialAccount[],
): PostBridgeSocialAccount[] {
  return accounts.filter(
    (account): account is PostBridgeSocialAccount =>
      Number.isFinite(account.id) &&
      isPostBridgePlatform(account.platform) &&
      typeof account.username === "string",
  );
}
