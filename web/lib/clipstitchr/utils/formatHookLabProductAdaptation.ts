import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";

export function formatHookLabProductAdaptation(
  adaptation: HookLabCreativeBriefContent,
) {
  return [
    "ADAPTED CONCEPT",
    adaptation.adaptedConcept ?? adaptation.directionName,
    "",
    "OPENING REACTION",
    adaptation.openingReaction ?? adaptation.openingVisual,
    "",
    "SCENE-BY-SCENE SHOT DIRECTIONS",
    ...(adaptation.sceneBySceneDirections ?? adaptation.beatScript),
    "",
    "SPOKEN LINES",
    ...(adaptation.spokenLines ?? [adaptation.hook]),
    "",
    "ON-SCREEN TEXT BY SCENE",
    ...(adaptation.onScreenTextByScene ?? [adaptation.soundOffOverlay]),
    "",
    "PROPS AND INTERACTIONS",
    ...(adaptation.propsAndInteractions ?? adaptation.footageNeeds),
    "",
    "PRODUCT DEMONSTRATION",
    adaptation.productDemonstration ?? adaptation.productProof,
    "",
    "CLOSING CTA",
    adaptation.closingCta ?? adaptation.callToAction,
    "",
    "ADAPTED CAPTION",
    adaptation.adaptedCaption ?? "",
  ].join("\n");
}
