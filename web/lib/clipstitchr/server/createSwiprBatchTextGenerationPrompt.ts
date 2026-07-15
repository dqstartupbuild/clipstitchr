import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";
import { getSwiprCallToActionPromptRule } from "@/lib/clipstitchr/server/getSwiprCallToActionPromptRule";
import { getSwiprProductPlacementPromptRules } from "@/lib/clipstitchr/server/getSwiprProductPlacementPromptRules";
import { getSwiprFinalProductMentionPromptRule } from "@/lib/clipstitchr/server/getSwiprFinalProductMentionPromptRule";
import { getGeneratedWritingAntiSlopPromptRules } from "@/lib/clipstitchr/server/getGeneratedWritingAntiSlopPromptRules";

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
      "(none yet - stay specific to the supplied audience and product context)",
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
    '      "hook": "the first slide - a specific viewer-first line, max ~8 words",',
    `      "slides": ["the hook again as slide 1", "slide 2", "...exactly ${slideCount} slides total, each max ~8 words, last follows the requested CTA style"],`,
    '      "caption": "a short plain caption; no emoji by default and at most one when it adds meaning",',
    '      "description": "a useful 1000-2000 character post description that adds new context without repeating the slides",',
    '      "hashtags": ["zero to three specific hashtags; use an empty array when none add value"],',
    '      "rationale": "one sentence on why this fits the supplied context"',
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
    "Aim for a substantial 1000-2000 character description because the long-form post text is part of the carousel strategy.",
    "Every paragraph must add something new: a concrete audience situation, why the pattern happens, a consequence, a context-supported example, or a practical next step.",
    "Do not restate every slide, repeat the hook in different words, pad with a generic introduction or conclusion, or keyword-stuff.",
    "Use only details supported by the supplied context. If the context cannot support 1000 useful characters without repetition or invention, return a shorter truthful description.",
    "Do not add an emoji by default. Use at most one only when it changes the meaning or tone.",
    "Return zero to three specific hashtags. Use an empty array when no hashtag adds useful context.",
    ...getGeneratedWritingAntiSlopPromptRules(),
    "Keep them on-brand, varied, simple, and genuinely good. Do not write generic filler. Do not invent fake stats, studies, quotes, or testimonials. Return ONLY the JSON object.",
  ]
    .filter(Boolean)
    .join("\n");
}
