import type { PublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerSettings";
import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";

export function createDefaultPublishingComposerSettings(
  provider: PublishingProvider,
): PublishingComposerSettings {
  if (provider === "instagram") {
    return { placement: "feed", provider: "instagram" };
  }
  return {
    allowComment: true,
    allowDuet: true,
    allowStitch: true,
    autoAddMusic: false,
    brandContent: false,
    brandOrganic: false,
    consentConfirmed: false,
    creatorInfoFetchedAt: null,
    isAigc: false,
    mode: "inbox",
    privacyLevel: "",
    provider: "tiktok",
  };
}
