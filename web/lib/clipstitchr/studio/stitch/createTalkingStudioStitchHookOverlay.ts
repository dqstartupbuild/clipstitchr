import type { StudioStitchTextOverlayPlan } from "../../types/studioStitch/StudioStitchTextOverlayPlan";
import { createStudioStitchTextStyle } from "./createStudioStitchTextStyle";

export function createTalkingStudioStitchHookOverlay(
  text: string,
  hookEndSeconds: number,
  groundingClaimIds: readonly string[],
): StudioStitchTextOverlayPlan {
  return {
    id: "overlay_hook",
    role: "hook",
    text,
    startSeconds: 0,
    endSeconds: hookEndSeconds,
    centerXPixels: 540,
    centerYPixels: 310,
    style: createStudioStitchTextStyle("hook", text, false),
    emphasis: false,
    groundingClaimIds: [...groundingClaimIds],
  };
}
