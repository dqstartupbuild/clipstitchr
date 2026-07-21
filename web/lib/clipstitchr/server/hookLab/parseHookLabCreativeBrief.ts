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

  const beatScript = readTextList(parsed.beatScript);
  const footageNeeds = readTextList(parsed.footageNeeds);

  if (!beatScript.length || !footageNeeds.length) {
    throw new Error("The creative brief was missing its shot plan.");
  }

  return {
    beatScript,
    callToAction: readText(parsed.callToAction, "No call to action yet."),
    directionName: readText(parsed.directionName, "Untitled direction").slice(
      0,
      120,
    ),
    footageNeeds,
    hook: readText(parsed.hook, "Write an original opening line."),
    openingVisual: readText(
      parsed.openingVisual,
      "Choose a clear first shot.",
    ),
    productProof: readText(
      parsed.productProof,
      "Show the product doing only what the saved details support.",
    ),
    soundOffOverlay: readText(
      parsed.soundOffOverlay,
      "Add a short sound-off opening.",
    ),
  };
}
