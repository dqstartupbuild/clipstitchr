import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { decryptPostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/decryptPostBridgeApiKey";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export async function resolvePostBridgeApiKey(
  convex: ConvexHttpClient,
) {
  const settings = await convex.query(api.postBridgeSettings.getSecret, {
    secret: getRateLimitApiSecret(),
  });

  if (!settings?.encryptedApiKey) {
    throw new Error(
      "Add your Post Bridge API key in Account settings before scheduling.",
    );
  }

  return decryptPostBridgeApiKey(settings.encryptedApiKey);
}
