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
    "Generate user-facing short-form hook text from a hidden template.",
    `Return compact valid JSON only with this exact shape: ${outputShape}`,
    "Rules:",
    "- Do not mention ClipStitchr, Clipr, Swipr, Stitchr, internal styles, templates, placeholders, or generation.",
    "- Do not include a CTA. Do not ask viewers to download, sign up, try, buy, DM, comment, follow, share, or visit a link.",
    "- Keep claims grounded in the product details. Do not invent numbers, studies, pricing, guarantees, or customer proof.",
    "- Use clear, direct language that can appear on social creative.",
    ...purposeRules.map((rule) => `- ${rule}`),
    `Hook style name: ${style.styleName}`,
    `Hook style principle: ${style.generationPrinciple}`,
    `Hook template: ${template.template}`,
    `Template variables: ${template.requiredVariables.join(", ") || "none"}`,
    `Product name: ${product.name}`,
    `Product details: ${product.productDetails}`,
    product.audienceDetails ? `Audience: ${product.audienceDetails}` : "",
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
