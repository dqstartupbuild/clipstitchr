import type { HookLabCreativeBriefContent } from "../../lib/clipstitchr/types/HookLabCreativeBriefContent";

const TEXT_LIMIT = 2_000;
const ITEM_LIMIT = 20;

function normalizeText(value: string) {
  return value.trim().slice(0, TEXT_LIMIT);
}

export function normalizeHookLabCreativeBriefContent(
  brief: HookLabCreativeBriefContent,
): HookLabCreativeBriefContent {
  return {
    beatScript: brief.beatScript
      .map(normalizeText)
      .filter(Boolean)
      .slice(0, ITEM_LIMIT),
    callToAction: normalizeText(brief.callToAction),
    directionName: normalizeText(brief.directionName).slice(0, 120),
    footageNeeds: brief.footageNeeds
      .map(normalizeText)
      .filter(Boolean)
      .slice(0, ITEM_LIMIT),
    hook: normalizeText(brief.hook),
    openingVisual: normalizeText(brief.openingVisual),
    productProof: normalizeText(brief.productProof),
    soundOffOverlay: normalizeText(brief.soundOffOverlay),
  };
}
