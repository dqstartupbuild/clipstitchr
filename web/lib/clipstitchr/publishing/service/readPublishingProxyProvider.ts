import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

export function readPublishingProxyProvider(
  value: string | undefined,
): PublishingProvider {
  if (value !== "instagram" && value !== "tiktok") {
    throw new PublishingProxyRequestError(404, "provider_not_found");
  }

  return value;
}
