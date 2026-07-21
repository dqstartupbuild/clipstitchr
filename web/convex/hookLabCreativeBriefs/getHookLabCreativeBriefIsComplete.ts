import type { HookLabCreativeBriefContent } from "../../lib/clipstitchr/types/HookLabCreativeBriefContent";

export function getHookLabCreativeBriefIsComplete(
  brief: HookLabCreativeBriefContent,
) {
  return Boolean(
    brief.directionName.trim() &&
      brief.openingVisual.trim() &&
      brief.hook.trim() &&
      brief.soundOffOverlay.trim() &&
      brief.beatScript.some((beat) => beat.trim()) &&
      brief.footageNeeds.some((need) => need.trim()) &&
      brief.productProof.trim() &&
      brief.callToAction.trim(),
  );
}
