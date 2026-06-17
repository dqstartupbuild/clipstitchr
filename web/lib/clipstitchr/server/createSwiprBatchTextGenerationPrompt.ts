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
    "You write short-form social media carousel slideshows for TikTok and Instagram.",
    "",
    "Account context:",
    `- App / brand: ${product.name} - ${product.productDetails}`,
    `- Audience: ${product.audienceDetails || "(unspecified)"}`,
    `- Niche / problem: ${product.inferredProblem || "(unspecified)"}`,
    "",
    "What's working for this account. Respect this closely:",
    product.emotionalNarrative ||
      product.inferredProblem ||
      "(none yet - use proven short-form patterns)",
    "",
    `Write ${count} distinct slideshows.`,
    "Respond with a JSON object of this exact shape:",
    '{ "slideshows": [{ "hook": "the first slide - a scroll-stopping line, max ~8 words", "slides": ["the hook again as slide 1", "slide 2", "...same count requested, each max ~8 words, last is a CTA like Save this"], "caption": "the post caption with 1-2 emoji", "hashtags": ["three", "relevant", "hashtags"], "rationale": "one sentence on why this should perform" }] }',
    "",
    "Rules:",
    "- Keep them on-brand, varied, and genuinely good.",
    "- Do not write generic filler.",
    "- Each slideshow must contain exactly the requested number of slides.",
    "- The first slide should hook the viewer's life, pain, desire, or belief.",
    "- The middle slides should pay off the hook with one clear idea.",
    "- Keep each slide short enough for a vertical carousel image.",
    "- Use simple human language.",
    "- Do not invent fake stats, fake studies, fake quotes, or fake testimonials.",
    "- Return only the JSON object.",
    `Requested slides per slideshow: ${slideCount}`,
  ].join("\n");
}
