import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";

function readText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, 2_000)
    : fallback;
}

function readTextList(value: unknown) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, 2_000))
        .filter(Boolean)
        .slice(0, 20)
    : [];
}

export function parseHookLabCreativeBrief(
  outputText: string,
): HookLabCreativeBriefContent {
  const start = outputText.indexOf("{");
  const end = outputText.lastIndexOf("}");

  if (start < 0 || end <= start) {
    throw new Error("The creative brief could not be read.");
  }

  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(outputText.slice(start, end + 1)) as Record<
      string,
      unknown
    >;
  } catch {
    throw new Error("The creative brief could not be read.");
  }

  const sceneBySceneDirections = readTextList(parsed.sceneBySceneDirections);
  const spokenLines = readTextList(parsed.spokenLines);
  const onScreenTextByScene = readTextList(parsed.onScreenTextByScene);
  const propsAndInteractions = readTextList(parsed.propsAndInteractions);

  if (
    !sceneBySceneDirections.length ||
    !spokenLines.length ||
    !onScreenTextByScene.length ||
    !propsAndInteractions.length
  ) {
    throw new Error("The product adaptation was missing its scene plan.");
  }

  const adaptedConcept = readText(
    parsed.adaptedConcept,
    "Adapt this reference concept for the selected product.",
  );
  const openingReaction = readText(
    parsed.openingReaction,
    "Match the reference opening reaction with the selected product in frame.",
  );
  const productDemonstration = readText(
    parsed.productDemonstration,
    "Show only product behavior supported by the saved product.",
  );
  const closingCta = readText(parsed.closingCta, "Show the next clear action.");
  const adaptedCaption = readText(
    parsed.adaptedCaption,
    "Write a caption that follows the reference structure.",
  );

  return {
    adaptedCaption,
    adaptedConcept,
    beatScript: sceneBySceneDirections,
    callToAction: closingCta,
    closingCta,
    directionName: adaptedConcept.slice(0, 120),
    footageNeeds: propsAndInteractions,
    hook: spokenLines[0] ?? openingReaction,
    onScreenTextByScene,
    openingReaction,
    openingVisual: openingReaction,
    productDemonstration,
    productProof: productDemonstration,
    propsAndInteractions,
    sceneBySceneDirections,
    soundOffOverlay: onScreenTextByScene[0] ?? "",
    spokenLines,
  };
}
