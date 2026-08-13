import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";

export function getPublishingProviderName(provider: PublishingProvider) {
  return provider === "instagram"
    ? "Instagram"
    : provider === "tiktok"
      ? "TikTok"
      : "YouTube";
}
