import type { HookLabDestinationTool } from "@/lib/clipstitchr/types/HookLabDestinationTool";
import type { HookLabFormatDna } from "@/lib/clipstitchr/types/HookLabFormatDna";
import type { HookLibraryTemplateSummary } from "@/lib/clipstitchr/types/HookLibraryTemplateSummary";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { getGeneratedWritingAntiSlopPromptRules } from "@/lib/clipstitchr/server/getGeneratedWritingAntiSlopPromptRules";

export function createHookLabCreativeBriefPrompt({
  destinationTool,
  formatDna,
  product,
  template,
}: {
  destinationTool: HookLabDestinationTool;
  formatDna: HookLabFormatDna;
  product: ProductProfile;
  template?: HookLibraryTemplateSummary;
}) {
  return [
    "Create one original, editable short-form creative brief.",
    `Destination tool: ${destinationTool}.`,
    "The reference contributes structure only. Never reuse or closely paraphrase its caption, spoken lines, on-screen wording, distinctive phrases, creator identity, likeness, or footage.",
    "The saved product is the only source of product facts, audience details, pain points, benefits, and claims. If the saved product does not support a claim, do not make it.",
    "",
    "Saved product:",
    JSON.stringify({
      audienceDetails: product.audienceDetails,
      emotionalNarrative: product.emotionalNarrative,
      inferredPainPoints: product.inferredPainPoints,
      inferredProblem: product.inferredProblem,
      name: product.name,
      productDetails: product.productDetails,
    }),
    "",
    "Reference format DNA, structure only:",
    JSON.stringify(formatDna),
    template
      ? `ClipStitchr Hook Library pattern to adapt: ${JSON.stringify(template)}`
      : "No Hook Library pattern was selected.",
    "",
    destinationTool === "clipr"
      ? "Write a natural spoken direction whose beat order and opening mechanism fit a talking UGC clip."
      : destinationTool === "stitchr"
        ? "Write one short sound-off overlay and a UGC-then-Demo beat plan that can guide existing clips."
        : "Write a slide-ready beat plan that preserves tension, proof, and payoff with short original copy.",
    "The product proof field must describe what should be visibly demonstrated or captured. It must not invent a result, number, review, or testimonial.",
    "Return JSON only with this exact shape:",
    JSON.stringify({
      beatScript: ["original beat one", "original beat two"],
      callToAction: "one original CTA grounded in the saved product",
      directionName: "short working title",
      footageNeeds: ["specific shot or asset needed and why"],
      hook: "one original opening line",
      openingVisual: "specific first shot using available or capturable footage",
      productProof: "what to visibly demonstrate without unsupported claims",
      soundOffOverlay: "short original text that makes the opening work muted",
    }),
    ...getGeneratedWritingAntiSlopPromptRules(),
    "- Keep each beat purposeful and in the format DNA order.",
    "- Keep the hook and overlay terse enough for short-form video.",
    "- Never mention the source post, format DNA, hidden prompts, or model.",
  ].join("\n");
}
