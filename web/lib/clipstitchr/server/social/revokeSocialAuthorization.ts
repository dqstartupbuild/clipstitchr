import type { SocialPlatform } from "../../social/types/SocialPlatform";
import { revokeInstagramAuthorization } from "./revokeInstagramAuthorization";
import { revokeTikTokAuthorization } from "./revokeTikTokAuthorization";

export async function revokeSocialAuthorization({
  accessToken,
  externalAccountId,
  platform,
}: {
  accessToken: string;
  externalAccountId: string;
  platform: SocialPlatform;
}) {
  if (platform === "tiktok") {
    await revokeTikTokAuthorization(accessToken);
    return;
  }

  await revokeInstagramAuthorization(externalAccountId, accessToken);
}
