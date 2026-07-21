import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";

export function getHookLabCreativeBriefDirection(
  brief: HookLabCreativeBriefContent,
) {
  return [
    brief.directionName,
    `Opening visual: ${brief.openingVisual}`,
    `Hook: ${brief.hook}`,
    `Sound-off text: ${brief.soundOffOverlay}`,
    `Beats: ${brief.beatScript.join(" | ")}`,
    `Footage: ${brief.footageNeeds.join(" | ")}`,
    `Product proof: ${brief.productProof}`,
    `CTA: ${brief.callToAction}`,
  ].join("\n");
}
