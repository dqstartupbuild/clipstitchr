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
    ...(brief.adaptedCaption
      ? { adaptedCaption: normalizeText(brief.adaptedCaption) }
      : {}),
    ...(brief.adaptedConcept
      ? { adaptedConcept: normalizeText(brief.adaptedConcept) }
      : {}),
    beatScript: brief.beatScript
      .map(normalizeText)
      .filter(Boolean)
      .slice(0, ITEM_LIMIT),
    callToAction: normalizeText(brief.callToAction),
    ...(brief.closingCta ? { closingCta: normalizeText(brief.closingCta) } : {}),
    directionName: normalizeText(brief.directionName).slice(0, 120),
    footageNeeds: brief.footageNeeds
      .map(normalizeText)
      .filter(Boolean)
      .slice(0, ITEM_LIMIT),
    hook: normalizeText(brief.hook),
    ...(brief.onScreenTextByScene
      ? {
          onScreenTextByScene: brief.onScreenTextByScene
            .map(normalizeText)
            .filter(Boolean)
            .slice(0, ITEM_LIMIT),
        }
      : {}),
    ...(brief.openingReaction
      ? { openingReaction: normalizeText(brief.openingReaction) }
      : {}),
    openingVisual: normalizeText(brief.openingVisual),
    productProof: normalizeText(brief.productProof),
    ...(brief.productDemonstration
      ? { productDemonstration: normalizeText(brief.productDemonstration) }
      : {}),
    ...(brief.propsAndInteractions
      ? {
          propsAndInteractions: brief.propsAndInteractions
            .map(normalizeText)
            .filter(Boolean)
            .slice(0, ITEM_LIMIT),
        }
      : {}),
    ...(brief.sceneBySceneDirections
      ? {
          sceneBySceneDirections: brief.sceneBySceneDirections
            .map(normalizeText)
            .filter(Boolean)
            .slice(0, ITEM_LIMIT),
        }
      : {}),
    soundOffOverlay: normalizeText(brief.soundOffOverlay),
    ...(brief.spokenLines
      ? {
          spokenLines: brief.spokenLines
            .map(normalizeText)
            .filter(Boolean)
            .slice(0, ITEM_LIMIT),
        }
      : {}),
  };
}
