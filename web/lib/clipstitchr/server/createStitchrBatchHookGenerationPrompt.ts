import type { StitchrBatchHookPlanningInput } from "@/lib/clipstitchr/types/StitchrBatchHookPlanningInput";
import { formatStitchrTextGenerationClipContext } from "@/lib/clipstitchr/server/formatStitchrTextGenerationClipContext";
import { getHookEdgeLevelLabel } from "@/lib/clipstitchr/utils/getHookEdgeLevelLabel";
import { getHookGenerationGoalLabel } from "@/lib/clipstitchr/utils/getHookGenerationGoalLabel";
import { formatHookLabPromptMemory } from "@/lib/clipstitchr/server/formatHookLabPromptMemory";

function formatHookExamples(label: string, examples?: string[]) {
  return [
    `${label}:`,
    examples?.length ? examples.map((example) => `- ${example}`).join("\n") : "- None saved yet.",
  ].join("\n");
}

function formatPlanningInput(input: StitchrBatchHookPlanningInput, index: number) {
  return [
    `Plan ${index + 1}`,
    `taskId: ${input.automationTaskId}`,
    `product: ${input.product.name}`,
    `product details: ${input.product.productDetails}`,
    `audience: ${input.product.audienceDetails || "(unspecified)"}`,
    `niche/problem: ${input.product.inferredProblem || "(unspecified)"}`,
    `goal: ${getHookGenerationGoalLabel(input.product.hookGenerationGoal)}`,
    `tone: ${getHookEdgeLevelLabel(input.product.hookEdgeLevel)}`,
    "style memory:",
    input.product.emotionalNarrative ||
      input.product.inferredProblem ||
      "(none yet - use proven short-form patterns)",
    "saved Idea patterns:",
    formatHookLabPromptMemory(input.product.hookLabTextBlueprints),
    formatHookExamples("hooks to avoid", input.product.rejectedHookExamples),
    "source clips:",
    input.stitchrClipContexts
      .map(formatStitchrTextGenerationClipContext)
      .join("\n"),
  ].join("\n");
}

export function createStitchrBatchHookGenerationPrompt({
  inputs,
}: {
  inputs: StitchrBatchHookPlanningInput[];
}) {
  return [
    "You write short visual overlay hooks and social captions for batches of TikTok/Reels/Shorts stitched videos.",
    "",
    "Each plan is one video with a short UGC reaction first and a product/demo clip second. There is no script or voiceover.",
    "Look across the whole batch before writing. Make every selected hook feel distinct, avoid repeated openings, and avoid using the same emotional angle twice unless the clip context truly calls for it.",
    "",
    "Return JSON with this exact shape:",
    "{",
    '  "plans": [',
    "    {",
    '      "taskId": "the taskId from the plan",',
    '      "filledHook": "best short visual overlay hook",',
    '      "overlayText": "same best short visual overlay hook",',
    '      "caption": "short feed caption, not a repeat of the overlay",',
    '      "hashtags": ["#tagone", "#tagtwo", "#tagthree"],',
    '      "angle": "short creative angle",',
    '      "reason": "why this hook fits the selected clips",',
    '      "hookVariants": [',
    '        { "text": "best short visual overlay hook", "angle": "short angle", "reason": "plain reason" }',
    "      ]",
    "    }",
    "  ]",
    "}",
    "",
    "Rules:",
    "- Return one plan for every taskId.",
    "- Each hook should be 3-9 words when possible and readable on a vertical video.",
    "- hookVariants must contain 6-8 distinct hooks, ranked best first.",
    "- hookVariants[0].text must match filledHook and overlayText.",
    "- Use visual details only when the clip context provides them.",
    "- Learn from saved Idea patterns by reusing their function and structure, never their source-specific wording.",
    "- Do not invent fake stats, fake studies, fake quotes, fake testimonials, or visual details.",
    "- Keep captions natural, short, and easy to post.",
    "- Hashtags must contain 3-5 lowercase hashtags, each starting with #.",
    "- Avoid generic phrases like game changer, level up, unlock growth, or work smarter.",
    "- Return only the JSON object.",
    "",
    "Batch plans:",
    inputs.map(formatPlanningInput).join("\n\n---\n\n"),
  ].join("\n");
}
