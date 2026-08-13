import type { StudioStitchTextOverlayPlan } from "../../types/studioStitch/StudioStitchTextOverlayPlan";
import { createStudioStitchTextStyle } from "./createStudioStitchTextStyle";

export function createTalkingStudioStitchCtaOverlay(
  text: string,
  durationSeconds: number,
  groundingClaimIds: readonly string[],
): StudioStitchTextOverlayPlan {
  return {
    id: "overlay_cta",
    role: "cta",
    text,
    startSeconds: durationSeconds - 4,
    endSeconds: durationSeconds,
    centerXPixels: 540,
    centerYPixels: 1248,
    style: createStudioStitchTextStyle("cta", text, true),
    emphasis: true,
    groundingClaimIds: [...groundingClaimIds],
  };
}
