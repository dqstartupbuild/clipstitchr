import { parseSocialTargetControls } from "@/lib/clipstitchr/social/parseSocialTargetControls";
import type { TikTokTargetControls } from "./TikTokTargetControls";

export function readTikTokTargetControls(
  controlsJson: string,
): TikTokTargetControls {
  const value = parseSocialTargetControls(controlsJson);

  return {
    allowComment: value.allowComment === true,
    allowDuet: value.allowDuet === true,
    allowStitch: value.allowStitch === true,
    autoAddMusic:
      value.autoAddMusic === undefined ? true : value.autoAddMusic === true,
    brandContentToggle: value.brandContentToggle === true,
    brandOrganicToggle: value.brandOrganicToggle === true,
    consentAcknowledged: value.consentAcknowledged === true,
    isAigc: value.isAigc === true,
    privacyLevel:
      typeof value.privacyLevel === "string"
        ? value.privacyLevel.trim()
        : undefined,
  };
}
