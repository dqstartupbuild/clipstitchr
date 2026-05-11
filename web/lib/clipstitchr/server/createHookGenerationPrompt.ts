import type { CliprHookStyle } from "@/lib/clipstitchr/types/CliprHookStyle";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { HookGenerationPurpose } from "@/lib/clipstitchr/types/HookGenerationPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type CreateHookGenerationPromptOptions = {
  product: ProductProfile;
  purpose: HookGenerationPurpose;
  slideCount?: number;
  style: CliprHookStyle;
  template: CliprHookTemplate;
};

export function createHookGenerationPrompt({
  product,
  purpose,
  slideCount,
  style,
  template,
}: CreateHookGenerationPromptOptions) {
  const outputShape =
    purpose === "swipr-slides"
      ? `{"slides":["slide text","slide text"]}`
      : `{"text":"overlay text"}`;
  const purposeRules =
    purpose === "swipr-slides"
      ? [
          `Generate exactly ${slideCount ?? 3} carousel slide text lines.`,
          "Each line must be under 72 characters.",
          "Make the lines read in order as one short useful idea.",
        ]
      : [
          "Generate one Stitchr overlay line under 72 characters.",
          "Make it work over a UGC-then-demo ad sequence.",
        ];

  return [
    "Generate user-facing short-form audience engagement text from a hidden template.",
    `Return compact valid JSON only with this exact shape: ${outputShape}`,
    "Rules:",
    "- This is not ad copy. The goal is to earn attention from a relevant audience, not to pitch the product.",
    "- Treat product details as private strategy context for the audience, problem, tension, and point of view.",
    "- Do not center the product, brand, features, pricing, offer, or availability.",
    "- Do not mention the product name unless the audience would need it for basic context.",
    "- Lead with a useful observation, relatable tension, myth, mistake, checklist, unpopular truth, or audience-specific insight.",
    "- Do not mention ClipStitchr, Clipr, Swipr, Stitchr, internal styles, templates, placeholders, or generation.",
    "- Do not include a CTA. Do not ask viewers to download, sign up, try, buy, DM, comment, follow, share, or visit a link.",
    "- Avoid promotional wording like best, must-have, game-changing, perfect for, solution, unlock, transform, limited, or order.",
    "- Keep claims grounded in the product details. Do not invent numbers, studies, pricing, guarantees, or customer proof.",
    "- Use clear, direct language that can appear on social creative.",
    ...purposeRules.map((rule) => `- ${rule}`),
    `Hook style name: ${style.styleName}`,
    `Hook style principle: ${style.generationPrinciple}`,
    `Hook template: ${template.template}`,
    `Template variables: ${template.requiredVariables.join(", ") || "none"}`,
    `Private product context, not ad copy: ${product.name}`,
    `Private product details, for audience inference only: ${product.productDetails}`,
    product.audienceDetails
      ? `Relevant audience to engage: ${product.audienceDetails}`
      : "",
    product.inferredProblem
      ? `Inferred problem: ${product.inferredProblem}`
      : "",
    product.inferredPainPoints.length
      ? `Inferred pain points: ${product.inferredPainPoints.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
