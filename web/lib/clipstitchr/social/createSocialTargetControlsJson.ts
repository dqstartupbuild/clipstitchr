import type { SocialComposeTargetDraft } from "./types/SocialComposeTargetDraft";

export function createSocialTargetControlsJson(
  target: SocialComposeTargetDraft,
  consentAcknowledged: boolean,
) {
  return JSON.stringify(
    target.platform === "tiktok"
      ? {
          allowComment: target.allowComment,
          allowDuet: target.allowDuet,
          allowStitch: target.allowStitch,
          autoAddMusic: target.autoAddMusic,
          brandContentToggle: target.brandContentToggle,
          brandOrganicToggle: target.brandOrganicToggle,
          consentAcknowledged,
          privacyLevel:
            target.publishMode === "direct"
              ? target.privacyLevel
              : undefined,
        }
      : {
          consentAcknowledged,
          shareToFeed: target.shareToFeed,
        },
  );
}
