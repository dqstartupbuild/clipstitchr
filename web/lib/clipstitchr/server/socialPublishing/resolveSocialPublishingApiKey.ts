import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { decryptSocialPublishingApiKey } from "@/lib/clipstitchr/server/socialPublishing/decryptSocialPublishingApiKey";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export async function resolveSocialPublishingApiKey(
  convex: ConvexHttpClient,
) {
  const settings = await convex.query(api.socialPublishingSettings.getSecret, {
    secret: getRateLimitApiSecret(),
  });

  if (!settings?.encryptedApiKey) {
    throw new Error(
      "Add your Zernio API key in Account settings before scheduling.",
    );
  }

  return decryptSocialPublishingApiKey(settings.encryptedApiKey);
}
