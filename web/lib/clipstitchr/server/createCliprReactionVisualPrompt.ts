import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { CliprReactionSourcePrompt } from "@/lib/clipstitchr/types/CliprReactionSourcePrompt";

export function createCliprReactionVisualPrompt({
  emotion,
  product,
  sourcePrompts,
}: {
  emotion: string;
  product: ProductProfile;
  sourcePrompts: CliprReactionSourcePrompt[];
}) {
  return [
    `Create one silent vertical UGC reaction clip of the avatar showing ${emotion}.`,
    "Use one continuous selfie-style shot with natural handheld micro-movement.",
    "The avatar should react to an implied moment related to the audience problem, not speak to camera.",
    "Keep the shot close enough to read the face and hands clearly.",
    "No dialogue, captions, subtitles, logos, product UI, or on-screen text.",
    `Audience context: ${product.audienceDetails}`,
    `Product context for relevance only: ${product.productDetails}`,
    product.inferredProblem ? `Audience problem: ${product.inferredProblem}` : "",
    product.inferredPainPoints.length
      ? `Pain points: ${product.inferredPainPoints.join("; ")}`
      : "",
    "Reaction reference descriptions:",
    ...sourcePrompts.map((prompt) => `- ${prompt.description}`),
  ]
    .filter(Boolean)
    .join("\n");
}
