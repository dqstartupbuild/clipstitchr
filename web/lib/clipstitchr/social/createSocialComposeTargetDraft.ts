import type { SocialComposeTargetDraft } from "./types/SocialComposeTargetDraft";
import type { SocialPlatform } from "./types/SocialPlatform";

export function createSocialComposeTargetDraft(
  accountId: string,
  platform: SocialPlatform,
): SocialComposeTargetDraft {
  return {
    accountId,
    platform,
    publishMode: "direct",
    privacyLevel: "",
    allowComment: false,
    allowDuet: false,
    allowStitch: false,
    autoAddMusic: true,
    brandContentToggle: false,
    brandOrganicToggle: false,
    commercialContentEnabled: false,
    shareToFeed: true,
  };
}
