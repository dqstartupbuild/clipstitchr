import type { HookLabCreativeBeat } from "@/lib/clipstitchr/types/HookLabCreativeBeat";
import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";
import type { HookLabVariationDirection } from "@/lib/clipstitchr/types/HookLabVariationDirection";
import { HOOK_LAB_EXACT_REUSE_GATE_NAMES } from "./hookLabExactReuseGateNames";
import { getGeneratedWritingAntiSlopPromptRules } from "@/lib/clipstitchr/server/getGeneratedWritingAntiSlopPromptRules";

type CreateHookLabUseGenerationPromptOptions = {
  audienceDetails: string;
  avoidPhrases: string[];
  creativeBeat: HookLabCreativeBeat;
  productDetails: string;
  productName: string;
  siblingHooks: string[];
  textBlueprint: HookLabTextBlueprint;
  variationDirection: HookLabVariationDirection;
};

export function createHookLabUseGenerationPrompt({
  audienceDetails,
  avoidPhrases,
  creativeBeat,
  productDetails,
  productName,
  siblingHooks,
  textBlueprint,
  variationDirection,
}: CreateHookLabUseGenerationPromptOptions) {
  return [
    "Create one fresh Hook Lab opening for a vertical UGC ad.",
    `Required hook treatment: ${variationDirection.hookTreatment}`,
    `Required visual detail: ${variationDirection.visualDirection}`,
    `Product: ${productName}.`,
    `Product details: ${productDetails}.`,
    `Audience: ${audienceDetails}.`,
    `Structured source text blueprint: ${JSON.stringify(textBlueprint)}.`,
    `Reusable creative beat: ${JSON.stringify(creativeBeat)}.`,
    `Avoid these phrases: ${JSON.stringify(avoidPhrases)}.`,
    `Hooks already used by sibling versions: ${JSON.stringify(siblingHooks)}. Do not duplicate or closely paraphrase them.`,
    "Judge every exact-reuse gate independently. Exact reuse is allowed only when every gate is true.",
    "If any gate is false, write a materially adapted hook that preserves the pattern and emotional job, not the source wording.",
    "Describe a single continuous 8-second avatar reaction shot. Keep identity, branding, source-specific objects, watermarks, usernames, audio, and shot-for-shot staging out.",
    ...getGeneratedWritingAntiSlopPromptRules(),
    "Return JSON only with exactReuseGates, adaptedHook, caption, visualPrompt, and visualPromptSummary.",
    "exactReuseGates must contain all eight named gates. Each gate must be an object with passes (boolean) and evidence (one short, specific sentence). A gate without evidence does not pass.",
    `Required exact-reuse gate names: ${HOOK_LAB_EXACT_REUSE_GATE_NAMES.join(", ")}.`,
  ].join("\n");
}
