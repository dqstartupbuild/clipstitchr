import type { StudioStitchTextOverlayPlan } from "../../types/studioStitch/StudioStitchTextOverlayPlan";
import { createStudioStitchTextStyle } from "./createStudioStitchTextStyle";

type ClassicStudioStitchOverlayInput = {
  readonly hookText: string;
  readonly supportingText: string;
  readonly ctaText: string;
  readonly hookEndSeconds: number;
  readonly durationSeconds: number;
  readonly hookClaimIds: readonly string[];
  readonly supportingClaimIds: readonly string[];
  readonly ctaClaimIds: readonly string[];
};

export function createClassicStudioStitchOverlays(
  input: ClassicStudioStitchOverlayInput,
): StudioStitchTextOverlayPlan[] {
  const ctaStartSeconds = Math.max(
    input.hookEndSeconds,
    input.durationSeconds - 2,
  );
  return [
    {
      id: "overlay_hook",
      role: "hook",
      text: input.hookText,
      startSeconds: 0,
      endSeconds: input.hookEndSeconds,
      centerXPixels: 540,
      centerYPixels: 310,
      style: createStudioStitchTextStyle("hook", input.hookText, false),
      emphasis: false,
      groundingClaimIds: [...input.hookClaimIds],
    },
    {
      id: "overlay_supporting",
      role: "supporting",
      text: input.supportingText,
      startSeconds: input.hookEndSeconds,
      endSeconds: ctaStartSeconds,
      centerXPixels: 540,
      centerYPixels: 390,
      style: createStudioStitchTextStyle(
        "supporting",
        input.supportingText,
        false,
      ),
      emphasis: false,
      groundingClaimIds: [...input.supportingClaimIds],
    },
    {
      id: "overlay_cta",
      role: "cta",
      text: input.ctaText,
      startSeconds: ctaStartSeconds,
      endSeconds: input.durationSeconds,
      centerXPixels: 540,
      centerYPixels: 1380,
      style: createStudioStitchTextStyle("cta", input.ctaText, true),
      emphasis: true,
      groundingClaimIds: [...input.ctaClaimIds],
    },
  ];
}
