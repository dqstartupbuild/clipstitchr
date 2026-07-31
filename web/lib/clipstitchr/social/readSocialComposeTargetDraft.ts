import { createSocialComposeTargetDraft } from "./createSocialComposeTargetDraft";
import type { SocialComposeTargetDraft } from "./types/SocialComposeTargetDraft";
import type { SocialPlatform } from "./types/SocialPlatform";

export function readSocialComposeTargetDraft({
  accountId,
  controlsJson,
  platform,
  publishMode,
}: {
  accountId: string;
  controlsJson: string;
  platform: SocialPlatform;
  publishMode: "direct" | "draft";
}): SocialComposeTargetDraft {
  const fallback = createSocialComposeTargetDraft(accountId, platform);

  try {
    const controls = JSON.parse(controlsJson) as Record<string, unknown>;

    return {
      ...fallback,
      publishMode,
      privacyLevel:
        typeof controls.privacyLevel === "string" ? controls.privacyLevel : "",
      allowComment: controls.allowComment === true,
      allowDuet: controls.allowDuet === true,
      allowStitch: controls.allowStitch === true,
      autoAddMusic:
        controls.autoAddMusic === undefined
          ? true
          : controls.autoAddMusic === true,
      brandContentToggle: controls.brandContentToggle === true,
      brandOrganicToggle: controls.brandOrganicToggle === true,
      commercialContentEnabled:
        controls.brandContentToggle === true ||
        controls.brandOrganicToggle === true,
      isAigc: controls.isAigc === true,
      shareToFeed:
        controls.shareToFeed === undefined
          ? true
          : controls.shareToFeed === true,
    };
  } catch {
    return fallback;
  }
}
