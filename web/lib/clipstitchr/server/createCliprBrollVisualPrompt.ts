import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createCliprBrollVisualPrompt(product: ProductProfile) {
  return [
    "Create one silent vertical day-in-the-life b-roll clip of the avatar.",
    "Use one continuous shot, 4 to 10 seconds, with natural real-world camera motion.",
    "The avatar should do one simple action that fits the product category and customer context.",
    "Examples of the intended style: a calisthenics product can show push-ups, an L-sit, or muscle-ups; a plumbing company can show work gear, driving to a job, or fixing a sink.",
    "Do not make a montage, scene change, tutorial, ad, product UI shot, or talking-head video.",
    "No dialogue, captions, subtitles, logos, or on-screen text.",
    `Product: ${product.name}`,
    `Product details: ${product.productDetails}`,
    `Audience: ${product.audienceDetails}`,
    product.inferredProblem ? `Audience problem: ${product.inferredProblem}` : "",
    product.inferredPainPoints.length
      ? `Pain points: ${product.inferredPainPoints.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
