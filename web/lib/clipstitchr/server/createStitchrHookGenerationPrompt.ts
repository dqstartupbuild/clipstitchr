import type { CliprPlaceholderFillers } from "@/lib/clipstitchr/types/CliprPlaceholderFillers";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import { formatStitchrTextGenerationClipContext } from "@/lib/clipstitchr/server/formatStitchrTextGenerationClipContext";
import { getGeneratedWritingAntiSlopPromptRules } from "@/lib/clipstitchr/server/getGeneratedWritingAntiSlopPromptRules";

type CreateStitchrHookGenerationPromptOptions = {
  fillers: CliprPlaceholderFillers;
  product: ProductProfile;
  stitchrClipContexts?: StitchrTextGenerationClipContext[];
};

export function createStitchrHookGenerationPrompt({
  fillers,
  product,
  stitchrClipContexts = [],
}: CreateStitchrHookGenerationPromptOptions) {
  const sourceContext = stitchrClipContexts.length
    ? stitchrClipContexts
        .map(formatStitchrTextGenerationClipContext)
        .join("\n")
    : "No clip details were supplied.";

  return [
    "Write one short text overlay and one feed caption for a vertical stitched video.",
    "The video places creator footage before a product demo. There is no generated voiceover.",
    "",
    "Product:",
    `- Name: ${product.name}`,
    `- Details: ${product.productDetails || "(unspecified)"}`,
    `- Audience: ${product.audienceDetails || "(unspecified)"}`,
    `- Problem: ${product.inferredProblem || "(unspecified)"}`,
    "",
    "Selected clips:",
    sourceContext,
    "",
    "Respond with only this JSON shape:",
    '{"filledHook":"short overlay text","overlayText":"same short overlay text","caption":"short feed caption","hashtags":["#tagone","#tagtwo","#tagthree"],"slides":["same short overlay text"],"script":"","scenePlan":[],"variablesUsed":{}}',
    "",
    "Rules:",
    "- Use a real detail from the selected clips when one is available.",
    "- If clip details are limited, stay grounded in the supplied product and audience.",
    "- Write one strong result. Do not return alternatives, rankings, saved patterns, or feedback options.",
    "- Keep overlayText and filledHook identical, natural, and easy to read.",
    "- Most overlays should be 3-9 words.",
    "- Make the caption add context instead of repeating the overlay.",
    "- Do not invent results, statistics, testimonials, or visual details.",
    "- hashtags must contain 3-5 lowercase hashtags without spaces.",
    "- slides must contain exactly one item matching filledHook.",
    "- script must be an empty string and scenePlan must be an empty array.",
    "- Never return placeholders or internal field labels.",
    ...getGeneratedWritingAntiSlopPromptRules(),
    `Optional audience language hints: ${JSON.stringify(fillers)}`,
  ].join("\n");
}
