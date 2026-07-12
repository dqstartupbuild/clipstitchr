import { getCliprJsonText } from "@/lib/clipstitchr/server/getCliprJsonText";
import { getHookLabParsedObject } from "./getHookLabParsedObject";
import { getHookLabParsedString } from "./getHookLabParsedString";
import { parseHookLabCreativeBeat } from "./parseHookLabCreativeBeat";
import { parseHookLabTextBlueprint } from "./parseHookLabTextBlueprint";

export function parseHookLabIdeaAnalysis(
  outputText: string,
  fallbackSourceText = "",
) {
  const parsed = getHookLabParsedObject(
    JSON.parse(getCliprJsonText(outputText)) as unknown,
  );
  const originalText =
    getHookLabParsedString(parsed.originalText, "", 1_000) ||
    fallbackSourceText.trim().slice(0, 1_000);

  return {
    creativeBeat: parseHookLabCreativeBeat(parsed.creativeBeat),
    name: getHookLabParsedString(parsed.name, "Saved idea", 120),
    originalText: originalText || undefined,
    textBlueprint: parseHookLabTextBlueprint(parsed.textBlueprint, originalText),
    whatToRepeat: getHookLabParsedString(
      parsed.whatToRepeat,
      "Repeat the hook's emotional turn with a fresh product-relevant visual.",
      500,
    ),
  };
}
