import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";

export type PostBridgeAccountOptions = {
  accounts: PostBridgeSocialAccount[];
  defaultSocialAccountIds: number[];
};
