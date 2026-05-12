import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprHookStyle } from "@/lib/clipstitchr/types/CliprHookStyle";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type CreateCliprScriptPromptOptions = {
  durationSeconds: CliprDurationSeconds;
  previousScripts?: string;
  product: ProductProfile;
  remainingSeconds?: number;
  segmentIndex: number;
  style: CliprHookStyle;
  template: CliprHookTemplate;
};

export function createCliprScriptPrompt({
  durationSeconds,
  previousScripts,
  product,
  remainingSeconds,
  segmentIndex,
  style,
  template,
}: CreateCliprScriptPromptOptions) {
  const targetSeconds = Math.max(
    8,
    Math.min(durationSeconds, remainingSeconds ?? durationSeconds),
  );

  return [
    "Write a short-form audience engagement video script for Clipr.",
    "Return compact valid JSON only with this exact shape:",
    '{"hook":"filled hook under 18 words","script":"spoken script","avatarPrompt":"avatar delivery prompt","title":"short saved clip title"}',
    "Rules:",
    "- This is not an ad script. The goal is to earn attention from a relevant audience, not to pitch the product.",
    "- Treat product details as private strategy context for choosing the audience, problem, tension, and point of view.",
    "- Do not center the product, brand, features, pricing, offer, or availability.",
    "- Do not mention the product name unless the audience would need it for basic context.",
    "- Lead with a useful observation, relatable tension, myth, mistake, checklist, unpopular truth, or audience-specific insight.",
    "- Make at least 80% of the script about the viewer's situation, belief, habit, problem, or desired outcome.",
    "- No CTA. Do not ask viewers to download, sign up, try, buy, book, DM, comment, follow, share, or visit a link.",
    "- Avoid promotional wording like best, must-have, game-changing, perfect for, solution, unlock, transform, limited, or order.",
    "- Do not mention ClipStitchr, Clipr, internal hook styles, models, placeholders, or generation.",
    "- Make the clip useful on its own and usable as a UGC-style Stitchr input.",
    "- Keep claims grounded in the product details. Do not invent numbers, studies, pricing, guarantees, or customer proof.",
    "- Write natural spoken language for one avatar talking to camera.",
    "- Do not include scene labels, timestamps, markdown, quotation marks around lines, or bracketed acting notes in the script.",
    "- The script should fit the target duration when read aloud.",
    `Target duration: ${targetSeconds} seconds.`,
    `Whole requested clip duration: ${durationSeconds} seconds.`,
    `Segment index: ${segmentIndex}.`,
    previousScripts?.trim()
      ? `Previous segment script context: ${previousScripts.trim()}`
      : "",
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
