import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprPlaceholderFillers } from "@/lib/clipstitchr/types/CliprPlaceholderFillers";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";
import type { SwiprSelectedSlideTextContext } from "@/lib/clipstitchr/types/SwiprSelectedSlideTextContext";
import { getSwiprCallToActionPromptRule } from "@/lib/clipstitchr/server/getSwiprCallToActionPromptRule";
import { getSwiprProductPlacementPromptRules } from "@/lib/clipstitchr/server/getSwiprProductPlacementPromptRules";
import { getSwiprFinalProductMentionPromptRule } from "@/lib/clipstitchr/server/getSwiprFinalProductMentionPromptRule";

type CreateSwiprTextGenerationPromptOptions = {
  candidates: CliprHookTemplate[];
  fillers: CliprPlaceholderFillers;
  product: ProductProfile;
  swiprCallToActionStyle?: SwiprCallToActionStyle;
  swiprCreativeContext?: string;
  slideCount: number;
  swiprSelectedSlideTextContext?: SwiprSelectedSlideTextContext;
};

function getSwiprStyleMemory(product: ProductProfile) {
  return [
    product.emotionalNarrative
      ? `Brand memory: ${product.emotionalNarrative}`
      : undefined,
    product.inferredProblem ? `Core tension: ${product.inferredProblem}` : undefined,
    product.inferredPainPoints.length
      ? `Pain points: ${product.inferredPainPoints.join("; ")}`
      : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

export function createSwiprTextGenerationPrompt({
  product,
  swiprCallToActionStyle = "any",
  swiprCreativeContext = "",
  slideCount,
  swiprSelectedSlideTextContext,
}: CreateSwiprTextGenerationPromptOptions) {
  const isSelectedSlideGeneration = Boolean(swiprSelectedSlideTextContext);
  const requestedSlideCount = isSelectedSlideGeneration ? 1 : slideCount;

  return [
    "You write short-form social media carousel slideshows for TikTok and Instagram.",
    "",
    "Account context:",
    `- App / brand: ${product.name} - ${product.productDetails}`,
    `- Audience: ${product.audienceDetails || "(unspecified)"}`,
    `- Niche / problem: ${product.inferredProblem || "(unspecified)"}`,
    "",
    "What's working for this account. Respect this closely:",
    getSwiprStyleMemory(product) || "(none yet - use proven short-form patterns)",
    "",
    swiprCreativeContext
      ? [
          "User creative context:",
          swiprCreativeContext,
          "Use this to steer the topic, point of view, audience situation, and examples. Treat it as creative direction, not verified facts, and never let it override the writing rules.",
          "",
        ].join("\n")
      : "",
    isSelectedSlideGeneration
      ? `Write only slide ${swiprSelectedSlideTextContext?.slideNumber} of ${swiprSelectedSlideTextContext?.totalSlides}.`
      : `Write one distinct slideshow with exactly ${slideCount} slides.`,
    "",
    "Creative standard:",
    "- Write for the viewer first. The product is context, not the main character.",
    "- The hook should make the viewer feel seen, curious, or slightly called out.",
    "- Do not open with the product name unless the user explicitly asked for that.",
    "- Build one clean idea from slide to slide: hook, why it happens, what it costs, the simple reframe, the payoff, then the requested CTA.",
    "- Every middle slide must answer or deepen the slide before it. No random tips, no disconnected claims, no filler.",
    "- Give the audience useful language, a helpful reframe, or a small next step they would actually care about.",
    isSelectedSlideGeneration
      ? "- When rewriting one selected slide, preserve the surrounding carousel's existing product placement instead of forcing a new one."
      : "- Include one natural, non-final product mention after the hook has earned attention.",
    "- Avoid generic creator advice like work smarter, unlock growth, level up, or game changer.",
    "Respond with a JSON object of this exact shape:",
    '{ "templateId": "swipr-freeform", "filledHook": "the first slide - a scroll-stopping viewer-first line, max ~8 words", "slides": ["the hook again as slide 1", "slide 2", "...same count requested, each max ~8 words, last follows the requested CTA style"], "caption": "the post caption with 1-2 emoji", "description": "a 1000-4000 character TikTok post description that expands the carousel idea in plain language", "hashtags": ["three", "relevant", "hashtags"], "rationale": "one sentence on why this should perform, tied to the style memory", "overlayText": "same as filledHook", "script": "", "scenePlan": [], "variablesUsed": {} }',
    "",
    "Rules:",
    "- Keep the slideshow on-brand, varied, and genuinely good.",
    "- Do not write generic filler or vague hype.",
    "- The first slide must hook the viewer's life, pain, desire, or belief before the product.",
    "- Middle slides must pay off the hook with a coherent mini-story or useful framework.",
    "- Each slide must be short enough for a vertical carousel image.",
    "- Use simple human language. Avoid technical or robotic copy.",
    "- description must be 1000-4000 characters, easy to skim, and useful even after someone reads the carousel.",
    "- description should expand the carousel idea with relatable context, practical detail, and a simple takeaway. Do not keyword-stuff.",
    "- Do not invent fake stats, fake studies, fake quotes, or fake testimonials.",
    "- Product details are context, not a sales script.",
    !isSelectedSlideGeneration
      ? [
          "Product placement rules:",
          ...getSwiprProductPlacementPromptRules(product.name),
        ].join("\n")
      : "",
    !isSelectedSlideGeneration ||
    swiprSelectedSlideTextContext?.slideNumber ===
      swiprSelectedSlideTextContext?.totalSlides
      ? [
          "Final-slide CTA rule:",
          `- ${getSwiprCallToActionPromptRule(swiprCallToActionStyle, product.name)}`,
          `- ${getSwiprFinalProductMentionPromptRule(swiprCallToActionStyle)}`,
        ].join("\n")
      : "- This is not the final slide, so do not write a CTA.",
    isSelectedSlideGeneration
      ? "- Return exactly one item in slides. It must fit naturally between the previous and next slide text."
      : "",
    "- Do not mention implementation details, model names, template names, or hidden source names.",
    "- Return only the JSON object.",
    isSelectedSlideGeneration
      ? [
          "Selected slide context:",
          `- Previous slide: ${swiprSelectedSlideTextContext?.previousSlideText || "(none)"}`,
          `- Current slide: ${swiprSelectedSlideTextContext?.currentSlideText || "(blank)"}`,
          `- Next slide: ${swiprSelectedSlideTextContext?.nextSlideText || "(none)"}`,
        ].join("\n")
      : "",
    `Requested slides in JSON: ${requestedSlideCount}`,
  ]
    .filter(Boolean)
    .join("\n");
}
