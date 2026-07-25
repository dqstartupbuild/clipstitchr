import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import { formatStitchrTextGenerationClipContext } from "@/lib/clipstitchr/server/formatStitchrTextGenerationClipContext";
import { getGeneratedWritingAntiSlopPromptRules } from "@/lib/clipstitchr/server/getGeneratedWritingAntiSlopPromptRules";

type CreateStitchrHookGenerationPromptOptions = {
  candidates: CliprHookTemplate[];
  product: ProductProfile;
  stitchrClipContexts?: StitchrTextGenerationClipContext[];
};

export function createStitchrHookGenerationPrompt({
  candidates,
  product,
  stitchrClipContexts = [],
}: CreateStitchrHookGenerationPromptOptions) {
  const sourceContext = stitchrClipContexts.length
    ? stitchrClipContexts
        .map(formatStitchrTextGenerationClipContext)
        .join("\n")
    : "No clip details were supplied.";

  return [
    "Write three strong text-overlay options and one feed caption for a vertical stitched video.",
    "The video places creator footage before a product demo. The overlay must bridge what the creator shows or feels into what the demo proves. There is no generated voiceover.",
    "",
    "Product truth:",
    `- Name: ${product.name}`,
    `- Details: ${product.productDetails || "(unspecified)"}`,
    `- Audience: ${product.audienceDetails || "(unspecified)"}`,
    `- Problem: ${product.inferredProblem || "(unspecified)"}`,
    `- Pain points: ${product.inferredPainPoints.join("; ") || "(unspecified)"}`,
    `- Emotional context: ${product.emotionalNarrative || "(unspecified)"}`,
    "",
    "Selected clips:",
    sourceContext,
    "",
    "Relevant Hook Library candidates:",
    JSON.stringify(
      candidates.map((candidate) => ({
        bestFor: candidate.bestFor,
        emotionalTrigger: candidate.emotionalTrigger,
        riskLevel: candidate.riskLevel,
        styleKey: candidate.styleKey,
        template: candidate.template,
        templateId: candidate.id,
      })),
    ),
    "",
    "Respond with only this JSON shape:",
    '{"templateId":"winning candidate id","hookOptions":[{"templateId":"candidate id","angle":"Relatable","text":"short overlay","caption":"short feed caption for this option"},{"templateId":"candidate id","angle":"Curiosity","text":"short overlay","caption":"short feed caption for this option"},{"templateId":"candidate id","angle":"Bold","text":"short overlay","caption":"short feed caption for this option"}],"filledHook":"exactly hookOptions[0].text","overlayText":"exactly hookOptions[0].text","caption":"exactly hookOptions[0].caption","hashtags":["#tagone","#tagtwo","#tagthree"],"slides":["same text as filledHook"],"script":"","scenePlan":[],"variablesUsed":{}}',
    "",
    "Rules:",
    "- First identify the UGC clip's strongest visible emotion, action, tension, or relatable problem and the Demo clip's strongest supported proof.",
    "- Use the Hook Library candidates as creative skeletons. Select only candidate IDs from the supplied list, then rewrite their wording naturally for these clips and this product.",
    "- Generate several drafts silently, score them for visual fit, specificity, truthfulness, sound-off clarity, and creator-like language, then return the strongest three distinct options.",
    "- hookOptions[0] is the winner. filledHook and overlayText must exactly match its text, and caption must exactly match its caption.",
    "- The three options must use meaningfully different angles: relatable recognition, curiosity, and a bolder challenge or contrast. Bold must never mean insulting, dishonest, or unsupported.",
    "- Make the overlay add meaning to the footage. Do not merely describe the visible action, repeat a clip title, paraphrase Product details, or paste an existing AI hook hint.",
    "- Treat an AI hook hint as weak creative evidence. Keep it only when it fits both selected clips and rewrite it instead of copying it.",
    "- Prefer a viewer thought, tension, realization, or open loop over a product slogan.",
    "- Prefer not to name the product in the overlay. Let the Demo reveal it unless the name is essential to the idea.",
    "- Every product behavior, result, comparison, and proof point must be directly supported by Product details or by an observed selected-clip detail.",
    "- If clip details are limited, stay grounded in the supplied product and audience and make a smaller claim.",
    "- Keep every option natural, specific, and easy to read. Most should be 3-10 words and none may exceed 14 words.",
    "- Avoid vague hooks that could fit any product, including 'the visible change,' 'wait for it,' 'this changes everything,' and 'you need to see this.'",
    "- Give every option its own caption. Each caption must add context instead of repeating its overlay.",
    "- Do not invent results, statistics, testimonials, or visual details.",
    "- Do not use a number, time saving, before-and-after result, superiority claim, or testimonial unless Product details explicitly support it.",
    "- hashtags must contain 3-5 lowercase hashtags without spaces.",
    "- slides must contain exactly one item matching filledHook.",
    "- script must be an empty string and scenePlan must be an empty array.",
    "- Never return placeholders or internal field labels.",
    ...getGeneratedWritingAntiSlopPromptRules(),
  ].join("\n");
}
