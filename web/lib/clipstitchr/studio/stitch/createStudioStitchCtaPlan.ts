import type { StudioStitchCtaPlan } from "../../types/studioStitch/StudioStitchCtaPlan";
import type { StudioStitchTextOverlayPlan } from "../../types/studioStitch/StudioStitchTextOverlayPlan";

export function createStudioStitchCtaPlan(
  overlay: StudioStitchTextOverlayPlan,
): StudioStitchCtaPlan {
  if (overlay.role !== "cta") {
    throw new Error("CTA plans require a CTA overlay.");
  }
  return {
    text: overlay.text,
    startSeconds: overlay.startSeconds,
    endSeconds: overlay.endSeconds,
    overlayId: overlay.id,
    groundingClaimIds: [...overlay.groundingClaimIds],
  };
}
