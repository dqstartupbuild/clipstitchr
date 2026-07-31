import type { SocialPlatform } from "../../social/types/SocialPlatform";

export function getSocialOAuthRedirectUri(platform: SocialPlatform) {
  const name =
    platform === "tiktok" ? "TIKTOK_REDIRECT_URI" : "INSTAGRAM_REDIRECT_URI";
  const configured = process.env[name]?.trim();

  if (!configured) {
    throw new Error(`Missing ${name}.`);
  }

  const url = new URL(configured);
  const isSecure = url.protocol === "https:";
  const isLocalDevelopment =
    url.protocol === "http:" && url.hostname === "localhost";

  if (!isSecure && !isLocalDevelopment) {
    throw new Error(`${name} must use HTTPS.`);
  }

  return url.toString();
}
