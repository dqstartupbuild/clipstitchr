import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";

export function getSocialPublishingAccountPlatforms(accounts: SocialPublishingSocialAccount[]) {
  return [...new Set(accounts.map((account) => account.platform))];
}
