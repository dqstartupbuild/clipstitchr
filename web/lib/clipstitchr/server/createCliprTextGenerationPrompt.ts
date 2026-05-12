import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprPlaceholderFillers } from "@/lib/clipstitchr/types/CliprPlaceholderFillers";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type CreateCliprTextGenerationPromptOptions = {
  candidates: CliprHookTemplate[];
  durationSeconds: CliprDurationSeconds;
  fillers: CliprPlaceholderFillers;
  product: ProductProfile;
  purpose: CliprTextPurpose;
  slideCount: number;
};

export function createCliprTextGenerationPrompt({
  candidates,
  durationSeconds,
  fillers,
  product,
  purpose,
  slideCount,
}: CreateCliprTextGenerationPromptOptions) {
  return [
    "Create non-promotional short-form engagement copy for ClipStitchr.",
    "Return only compact JSON with this exact shape:",
    '{"templateId":"one candidate id","filledHook":"short hook","variablesUsed":{"placeholder":"value"},"overlayText":"short editable overlay","slides":["first slide hook","supporting point"],"script":"30 or 60 second spoken avatar script","scenePlan":[{"sceneType":"avatar","scriptText":"the same full spoken script","visualPrompt":"vertical avatar video prompt","estimatedDurationSeconds":30}]}',
    "Rules:",
    "- Do not include a CTA.",
    "- Do not ask viewers to try, download, save, comment, follow, buy, book, subscribe, or sign up.",
    "- Do not directly promote the product.",
    "- Do not invent fake stats, fake studies, fake quotes, or fake testimonials.",
    "- Keep the hook useful, specific, and under 18 words when possible.",
    "- For Swipr, slides[0] must be the hook and the remaining slides must pay it off.",
    "- For Stitchr, overlayText must be one concise editable text overlay.",
    "- For Clipr, script must start with the hook and must be written as a natural spoken avatar monologue.",
    "- For Clipr, scenePlan must contain exactly one avatar scene and no supplemental scenes.",
    "- For Clipr, scenePlan[0].scriptText must match the full script, not a short summary.",
    `Purpose: ${purpose}`,
    `Target duration: ${durationSeconds} seconds`,
    `Slide count: ${slideCount}`,
    `Product name: ${product.name}`,
    `Product details: ${product.productDetails}`,
    `Audience details: ${product.audienceDetails}`,
    `Inferred problem: ${product.inferredProblem ?? ""}`,
    `Pain points: ${product.inferredPainPoints.join("; ")}`,
    `Placeholder fillers: ${JSON.stringify(fillers)}`,
    `Candidate templates: ${JSON.stringify(
      candidates.map((candidate) => ({
        templateId: candidate.id,
        template: candidate.template,
        requiredVariables: candidate.requiredVariables,
      })),
    )}`,
  ].join("\n");
}
