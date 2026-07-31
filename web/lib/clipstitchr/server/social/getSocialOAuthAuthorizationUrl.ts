import type { SocialPlatform } from "../../social/types/SocialPlatform";

export function getSocialOAuthAuthorizationUrl({
  platform,
  redirectUri,
  state,
}: {
  platform: SocialPlatform;
  redirectUri: string;
  state: string;
}) {
  const isTikTok = platform === "tiktok";
  const clientId = isTikTok
    ? process.env.TIKTOK_CLIENT_KEY?.trim()
    : process.env.INSTAGRAM_CLIENT_ID?.trim();

  if (!clientId) {
    throw new Error(
      isTikTok
        ? "TikTok connection is not configured."
        : "Instagram connection is not configured.",
    );
  }

  const url = new URL(
    isTikTok
      ? "https://www.tiktok.com/v2/auth/authorize/"
      : "https://www.instagram.com/oauth/authorize",
  );
  url.searchParams.set(isTikTok ? "client_key" : "client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set(
    "scope",
    isTikTok
      ? "user.info.basic,video.publish,video.upload,video.list"
      : "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_insights",
  );

  return url.toString();
}
