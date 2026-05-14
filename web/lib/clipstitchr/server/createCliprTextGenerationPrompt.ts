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

function getPurposeRules(purpose: CliprTextPurpose) {
  if (purpose === "clipr") {
    return [
      "- For Clipr, do not directly promote the product.",
      "- For Clipr, script must start with the hook and must be written as a natural spoken avatar monologue.",
      "- For Clipr, scenePlan must contain exactly one avatar scene and no supplemental scenes.",
      "- For Clipr, scenePlan[0].scriptText must match the full script, not a short summary.",
    ];
  }

  if (purpose === "swipr") {
    return [
      "- For Swipr, the generated text may frame the selected product as the useful example or solution.",
      "- For Swipr, slides must contain exactly the requested slide count.",
      "- For Swipr, slides[0] must exactly match filledHook.",
      "- For Swipr, slides after the hook must pay off the hook with a clear reason, mechanism, proof point, or next step.",
      "- For Swipr, the final slide must be a product CTA that mentions the product name. Use a soft CTA such as \"Use [product] when...\" or \"Make this easier with [product]\".",
      "- For Swipr, do not repeat the hook after slide 1 and do not make every slide another hook.",
      "- For Swipr, make every slide short enough for a vertical carousel image.",
    ];
  }

  return [
    "- For Stitchr, the generated text may frame the selected product as the useful example or solution.",
    "- For Stitchr, overlayText must be one concise editable text overlay.",
    "- For Stitchr, write overlayText as an ad hook that can sit over a UGC-then-demo sequence.",
  ];
}

export function createCliprTextGenerationPrompt({
  candidates,
  durationSeconds,
  fillers,
  product,
  purpose,
  slideCount,
}: CreateCliprTextGenerationPromptOptions) {
  return [
    "Create short-form hook copy for ClipStitchr.",
    "Return only compact JSON with this exact shape:",
    '{"templateId":"one candidate id","filledHook":"short hook","variablesUsed":{"placeholder":"value"},"overlayText":"short editable overlay","slides":["first slide hook","supporting point"],"script":"30 or 60 second spoken avatar script","scenePlan":[{"sceneType":"avatar","scriptText":"the same full spoken script","visualPrompt":"vertical avatar video prompt","estimatedDurationSeconds":30}]}',
    "Rules:",
    "- Except for the final Swipr CTA slide, do not ask viewers to try, download, save, comment, follow, buy, book, subscribe, or sign up.",
    "- Do not invent fake stats, fake studies, fake quotes, or fake testimonials.",
    "- Keep the hook useful, specific, and under 18 words when possible.",
    "- If a candidate comes from a hook library, adapt the pattern to the product instead of copying it mechanically.",
    "- filledHook must be final human-readable copy, not a raw placeholder fill.",
    "- Rewrite filler values as needed so the sentence is grammatical. Change tense, article, plurality, or wording instead of pasting filler text verbatim.",
    "- Never return unresolved placeholders, placeholder labels, snake_case keys, or database-style labels in filledHook or slides.",
    "- Before returning JSON, silently reject any hook that reads like gibberish, has awkward duplicated words, or only makes sense if the reader sees the template.",
    ...getPurposeRules(purpose),
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
        source: candidate.source,
      })),
    )}`,
  ].join("\n");
}
