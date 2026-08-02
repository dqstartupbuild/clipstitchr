import type { PublishingMediaFetchRequirements } from "@/lib/clipstitchr/publishing/media/PublishingMediaFetchRequirements";
import type { PublishingMediaProvider } from "@/lib/clipstitchr/publishing/media/PublishingMediaProvider";

export function getPublishingMediaFetchRequirements(
  provider: PublishingMediaProvider,
): PublishingMediaFetchRequirements {
  if (provider === "tiktok") {
    return {
      minimumRemainingSeconds: 4200,
      requestedValiditySeconds: 4500,
      requiresHead: true,
      requiresNoRedirect: true,
      requiresRange: true,
      requiresVerifiedClipStitchrDomain: true,
    };
  }

  return {
    minimumRemainingSeconds: 300,
    requestedValiditySeconds: 900,
    requiresHead: false,
    requiresNoRedirect: false,
    requiresRange: false,
    requiresVerifiedClipStitchrDomain: false,
  };
}
