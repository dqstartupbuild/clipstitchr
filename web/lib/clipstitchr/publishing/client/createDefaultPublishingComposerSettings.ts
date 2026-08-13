import type { PublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerSettings";
import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";
import type { PublishingThumbnailSelection } from "@/lib/clipstitchr/publishing/client/contracts/PublishingThumbnailSelection";

export function createDefaultPublishingComposerSettings(
  provider: PublishingProvider,
  thumbnail: PublishingThumbnailSelection | null = null,
): PublishingComposerSettings {
  if (provider === "instagram") {
    return { placement: "feed", provider: "instagram" };
  }
  if (provider === "youtube") {
    return {
      description: "",
      madeForKids: null,
      provider: "youtube",
      tags: [],
      thumbnail,
      title: "",
      visibility: "private",
    };
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
