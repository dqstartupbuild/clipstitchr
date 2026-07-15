import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";
import type { HookLabVariationDirection } from "@/lib/clipstitchr/types/HookLabVariationDirection";
import { getGeneratedWritingAntiSlopPromptRules } from "@/lib/clipstitchr/server/getGeneratedWritingAntiSlopPromptRules";

export function createHookLabAdaptedTextRewritePrompt({
  candidateText,
  productName,
  sourceText,
  siblingHooks,
  textBlueprint,
  variationDirection,
}: {
  candidateText: string;
  productName: string;
  sourceText: string;
  siblingHooks: string[];
  textBlueprint: HookLabTextBlueprint;
  variationDirection: HookLabVariationDirection;
}) {
  return [
    "Rewrite one ad hook because the first adaptation is too similar to its source.",
    `Source text: ${JSON.stringify(sourceText)}.`,
    `Rejected adaptation: ${JSON.stringify(candidateText)}.`,
    `Product: ${productName}.`,
    `Reusable structure: ${JSON.stringify(textBlueprint)}.`,
    `Required hook treatment: ${variationDirection.hookTreatment}`,
    `Other hooks already used in this batch: ${JSON.stringify(siblingHooks)}.`,
    "Keep only the abstract pattern and emotional job. Change the wording, syntax, and product-specific framing materially.",
    "Do not quote, lightly paraphrase, preserve a distinctive source phrase, or overlap the other batch hooks.",
    "Keep it short and natural for an on-screen hook.",
    ...getGeneratedWritingAntiSlopPromptRules(),
    "Return JSON only: {\"adaptedHook\":\"...\"}.",
  ].join("\n");
}
