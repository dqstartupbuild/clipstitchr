import type { CliprPlaceholderFillers } from "@/lib/clipstitchr/types/CliprPlaceholderFillers";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import { formatStitchrTextGenerationClipContext } from "@/lib/clipstitchr/server/formatStitchrTextGenerationClipContext";

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
    "Stitchr source context:",
    sourceContext,
    "",
    "Write one visual overlay hook and one feed caption for a stitched video.",
    "The video has a short UGC reaction followed by a product or demo clip. There is no script or voiceover.",
    "Use the source context when it gives you a real visual detail, reaction, or demo payoff. If the source context is thin, use the account context instead and do not invent details.",
    "",
    "Respond with a JSON object of this exact shape:",
    '{"templateId":"stitchr-emotional-narrative","filledHook":"short visual overlay hook","variablesUsed":{"placeholder":"value"},"overlayText":"same short visual overlay hook","caption":"short caption hook related to the overlay and clips","hashtags":["#tagone","#tagtwo","#tagthree"],"slides":["same short visual overlay hook"],"script":"","scenePlan":[]}',
    "",
    "Creative standard:",
    "- Write for the viewer first. The product is context, not the main character.",
    "- The hook should make the viewer feel seen, curious, surprised, or slightly called out.",
    "- The hook should fit what appears to happen in the selected UGC/demo clips when that context is useful.",
    "- Do not open with the product name unless the source context makes that feel natural.",
    "- Use product facts only as quiet background proof. Do not explain features or write a product pitch.",
    "- The caption should be a second simple hook for the feed caption, not a repeat of the overlay.",
    "- Keep the caption natural and short. It can include 1-2 emoji when it fits.",
    "- Avoid generic creator advice like work smarter, unlock growth, level up, or game changer.",
    "Rules:",
    "- Keep the hook and caption on-brand, simple, and genuinely good.",
    "- Do not write generic filler or vague hype.",
    "- filledHook and overlayText must be the same final human-readable hook.",
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
