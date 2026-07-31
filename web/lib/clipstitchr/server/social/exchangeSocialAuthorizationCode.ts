import type { SocialPlatform } from "../../social/types/SocialPlatform";
import { exchangeInstagramAuthorizationCode } from "./exchangeInstagramAuthorizationCode";
import { exchangeTikTokAuthorizationCode } from "./exchangeTikTokAuthorizationCode";

export async function exchangeSocialAuthorizationCode({
  code,
  platform,
  redirectUri,
}: {
  code: string;
  platform: SocialPlatform;
  redirectUri: string;
}) {
  return platform === "tiktok"
    ? await exchangeTikTokAuthorizationCode({ code, redirectUri })
    : await exchangeInstagramAuthorizationCode({ code, redirectUri });
}
