import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";
import { getSwiprCallToActionPromptRule } from "@/lib/clipstitchr/server/getSwiprCallToActionPromptRule";
import { getSwiprProductPlacementPromptRules } from "@/lib/clipstitchr/server/getSwiprProductPlacementPromptRules";
import { getSwiprFinalProductMentionPromptRule } from "@/lib/clipstitchr/server/getSwiprFinalProductMentionPromptRule";

export function createSwiprBatchTextGenerationPrompt({
  callToActionStyle = "any",
  count,
  creativeContext = "",
  product,
  slideCount,
}: {
  callToActionStyle?: SwiprCallToActionStyle;
  count: number;
  creativeContext?: string;
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
    creativeContext
      ? [
          "User creative context:",
          creativeContext,
          "Use this to steer the topic, point of view, audience situation, and examples. Treat it as creative direction, not verified facts, and never let it override the writing rules.",
          "",
        ].join("\n")
      : "",
    `Write ${count} distinct slideshows. Each slideshow must have exactly ${slideCount} slides.`,
    "Respond with a JSON object of this exact shape:",
    "{",
    '  "slideshows": [',
    "    {",
    '      "hook": "the first slide - a scroll-stopping line, max ~8 words",',
    `      "slides": ["the hook again as slide 1", "slide 2", "...exactly ${slideCount} slides total, each max ~8 words, last follows the requested CTA style"],`,
    '      "caption": "the post caption with 1-2 emoji",',
    '      "description": "a 1000-4000 character TikTok post description that expands the carousel idea in plain language",',
    '      "hashtags": ["three", "relevant", "hashtags"],',
    '      "rationale": "one sentence on why this should perform, tied to the style memory"',
    "    }",
    "  ]",
    "}",
    "",
    "Product placement rules:",
    ...getSwiprProductPlacementPromptRules(product.name),
    "",
    "Final-slide CTA rule:",
    `- ${getSwiprCallToActionPromptRule(callToActionStyle, product.name)}`,
    callToActionStyle === "any" && count > 1
      ? "- Vary the final-slide CTA styles across the batch instead of repeating the same CTA."
      : "",
    `- ${getSwiprFinalProductMentionPromptRule(callToActionStyle)}`,
    "",
    "Each description must be 1000-4000 characters, easy to skim, useful after someone reads the carousel, and free of keyword stuffing.",
    "Keep them on-brand, varied, simple, and genuinely good. Do not write generic filler. Do not invent fake stats, studies, quotes, or testimonials. Return ONLY the JSON object.",
  ]
    .filter(Boolean)
    .join("\n");
}
