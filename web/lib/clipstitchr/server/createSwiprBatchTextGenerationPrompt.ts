import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createSwiprBatchTextGenerationPrompt({
  count,
  product,
  slideCount,
}: {
  count: number;
  product: ProductProfile;
  slideCount: number;
}) {
  return [
    "You write short-form social media carousel slideshows (TikTok/Instagram).",
    "",
    "Account context:",
    `- App / brand: ${product.name} - ${product.productDetails}`,
    `- Audience: ${product.audienceDetails || "(unspecified)"}`,
    `- Niche / problem: ${product.inferredProblem || "(unspecified)"}`,
    "",
    "What's working for this account (style memory - respect this closely):",
    product.emotionalNarrative ||
      product.inferredProblem ||
      "(none yet - use proven short-form patterns)",
    "",
    `Write ${count} distinct slideshows. Each slideshow must have exactly ${slideCount} slides.`,
    "Respond with a JSON object of this exact shape:",
    "{",
    '  "slideshows": [',
    "    {",
    '      "hook": "the first slide - a scroll-stopping line, max ~8 words",',
    `      "slides": ["the hook again as slide 1", "slide 2", "...exactly ${slideCount} slides total, each max ~8 words, last is a CTA like Save this"],`,
    '      "caption": "the post caption with 1-2 emoji",',
    '      "hashtags": ["three", "relevant", "hashtags"],',
    '      "rationale": "one sentence on why this should perform, tied to the style memory"',
    "    }",
    "  ]",
    "}",
    "",
    "Keep them on-brand, varied, simple, and genuinely good. Do not write generic filler. Do not invent fake stats, studies, quotes, or testimonials. Return ONLY the JSON object.",
  ].join("\n");
}
