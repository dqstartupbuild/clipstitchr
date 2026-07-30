import { parseSocialTargetControls } from "../../lib/clipstitchr/social/parseSocialTargetControls";
import { getTikTokBrandedContentPrivacyIsCompatible } from "../../lib/clipstitchr/social/getTikTokBrandedContentPrivacyIsCompatible";

export function validateTikTokTargetControls(
  controlsJson: string,
  publishMode: "direct" | "draft",
) {
  const controls = parseSocialTargetControls(controlsJson);

  if (controls.consentAcknowledged !== true) {
    throw new Error("Confirm that you agree to share this post with TikTok.");
  }

  if (
    publishMode === "direct" &&
    (typeof controls.privacyLevel !== "string" || !controls.privacyLevel.trim())
  ) {
    throw new Error("Choose who can watch this TikTok.");
  }

  for (const key of ["allowComment", "allowDuet", "allowStitch"]) {
    if (controls[key] !== undefined && typeof controls[key] !== "boolean") {
      throw new Error("TikTok interaction choices are invalid.");
    }
  }

  if (
    !getTikTokBrandedContentPrivacyIsCompatible(
      controls.brandContentToggle === true,
      typeof controls.privacyLevel === "string"
        ? controls.privacyLevel
        : undefined,
    )
  ) {
    throw new Error(
      "TikTok paid branded content cannot use Only you visibility.",
    );
  }

  return controls;
}
