import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

export function getPostBridgeAccountPlatforms(accounts: PostBridgeSocialAccount[]) {
  return [...new Set(accounts.map((account) => account.platform))];
}
