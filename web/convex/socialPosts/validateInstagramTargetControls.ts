import { parseSocialTargetControls } from "../../lib/clipstitchr/social/parseSocialTargetControls";

export function validateInstagramTargetControls(controlsJson: string) {
  const controls = parseSocialTargetControls(controlsJson);

  if (controls.consentAcknowledged !== true) {
    throw new Error(
      "Confirm that you agree to share this post with Instagram.",
    );
  }

  return controls;
}
