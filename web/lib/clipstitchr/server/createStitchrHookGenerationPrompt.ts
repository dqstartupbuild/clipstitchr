import type { CliprPlaceholderFillers } from "@/lib/clipstitchr/types/CliprPlaceholderFillers";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import { getHookEdgeLevelLabel } from "@/lib/clipstitchr/utils/getHookEdgeLevelLabel";
import { getHookGenerationGoalLabel } from "@/lib/clipstitchr/utils/getHookGenerationGoalLabel";
import { formatStitchrTextGenerationClipContext } from "@/lib/clipstitchr/server/formatStitchrTextGenerationClipContext";
import { formatHookLabPromptMemory } from "@/lib/clipstitchr/server/formatHookLabPromptMemory";

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
  const rejectedHookExamples = product.rejectedHookExamples?.length
    ? product.rejectedHookExamples.map((example) => `- ${example}`).join("\n")
    : "- None saved yet.";
  const sourceContext = stitchrClipContexts.length
    ? stitchrClipContexts
        .map(formatStitchrTextGenerationClipContext)
        .join("\n")
    : "No source clip context was provided. Use product/audience context only.";

  return [
    "You write short-form social hooks and captions for TikTok, Reels, and Shorts.",
    "",
    "Account context:",
    `- App / brand: ${product.name} - ${product.productDetails}`,
    `- Audience: ${product.audienceDetails || "(unspecified)"}`,
    `- Niche / problem: ${product.inferredProblem || "(unspecified)"}`,
    "",
    "What's working for this account. Respect this closely:",
    product.emotionalNarrative ||
      product.inferredProblem ||
      "(none yet - use proven short-form patterns)",
    "",
    "Hook Lab memory:",
    `- Goal: ${getHookGenerationGoalLabel(product.hookGenerationGoal)}`,
    `- Tone: ${getHookEdgeLevelLabel(product.hookEdgeLevel)}`,
    "Saved Idea patterns:",
    formatHookLabPromptMemory(product.hookLabTextBlueprints),
    "Hooks to avoid:",
    rejectedHookExamples,
    "",
    "Stitchr source context:",
    sourceContext,
    "",
    "Write eight ranked visual overlay hook options and one feed caption for a stitched video.",
    "The video has a short UGC reaction followed by a product or demo clip. There is no script or voiceover.",
    "Use the source context when it gives you a real visual detail, reaction, or demo payoff. If the source context is thin, use the account context instead and do not invent details.",
    "",
    "Respond with a JSON object of this exact shape:",
    '{"templateId":"stitchr-hook-lab","filledHook":"best short visual overlay hook","variablesUsed":{"placeholder":"value"},"overlayText":"same best short visual overlay hook","caption":"short caption hook related to the overlay and clips","hashtags":["#tagone","#tagtwo","#tagthree"],"hookVariants":[{"text":"best short visual overlay hook","angle":"why this angle should stop the scroll","reason":"why it fits this product and clip pair"}],"slides":["same best short visual overlay hook"],"script":"","scenePlan":[]}',
    "",
    "Creative standard:",
    "- Write for the viewer first. The product is context, not the main character.",
    "- The hook should make the viewer feel seen, curious, surprised, or slightly called out.",
    "- The hook should fit what appears to happen in the selected UGC/demo clips when that context is useful.",
    "- Use saved Idea patterns as structured creative memory. Preserve their function, not source wording.",
    "- Never reproduce source-specific names, brands, claims, references, or unresolved slots from an Idea pattern.",
    "- Avoid the saved rejected hooks and avoid their cadence.",
    "- Do not open with the product name unless the source context makes that feel natural.",
    "- Use product facts only as quiet background proof. Do not explain features or write a product pitch.",
    "- The caption should be a second simple hook for the feed caption, not a repeat of the overlay.",
    "- Keep the caption natural and short. It can include 1-2 emoji when it fits.",
    "- Avoid generic creator advice like work smarter, unlock growth, level up, or game changer.",
    "Rules:",
    "- Keep the hook and caption on-brand, simple, and genuinely good.",
    "- Do not write generic filler or vague hype.",
    "- filledHook and overlayText must be the same final human-readable hook.",
    "- hookVariants must contain 6-8 distinct hooks, ranked best first.",
    "- hookVariants[0].text must match filledHook and overlayText.",
    "- Each hookVariants item must have a short plain-language angle and reason.",
    "- Most hooks should be 3-9 words and readable on a vertical video.",
    "- Do not invent fake stats, fake studies, fake quotes, fake testimonials, or visual details not present in the context.",
    "- hashtags must contain 3-5 hashtags, all lowercase, no spaces, each starting with #.",
    "- slides must contain exactly one item, matching filledHook.",
    "- script must be an empty string and scenePlan must be an empty array.",
    "- Never return unresolved placeholders, placeholder labels, snake_case keys, or database-style labels.",
    "- Return only the JSON object.",
    `Audience language hints: ${JSON.stringify(fillers)}`,
  ].join("\n");
}
