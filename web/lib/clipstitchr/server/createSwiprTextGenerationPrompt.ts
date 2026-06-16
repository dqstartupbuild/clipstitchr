import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprPlaceholderFillers } from "@/lib/clipstitchr/types/CliprPlaceholderFillers";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type CreateSwiprTextGenerationPromptOptions = {
  candidates: CliprHookTemplate[];
  fillers: CliprPlaceholderFillers;
  product: ProductProfile;
  scriptIdea?: string;
  slideCount: number;
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
  candidates,
  fillers,
  product,
  scriptIdea,
  slideCount,
}: CreateSwiprTextGenerationPromptOptions) {
  return [
    "You write short-form social media carousel slideshows for TikTok and Instagram.",
    "",
    "Account context:",
    `- App / brand: ${product.name} — ${product.productDetails}`,
    `- Audience: ${product.audienceDetails || "(unspecified)"}`,
    `- Niche / problem: ${product.inferredProblem || "(unspecified)"}`,
    "",
    "What's working for this account. Respect this closely:",
    getSwiprStyleMemory(product) || "(none yet — use proven short-form patterns)",
    "",
    `Write one distinct slideshow with exactly ${slideCount} slides.`,
    "Respond with a JSON object of this exact shape:",
    '{ "templateId": "one candidate id", "filledHook": "the first slide — a scroll-stopping line, max ~8 words", "slides": ["the hook again as slide 1", "slide 2", "...same count requested, each max ~8 words, last is a simple CTA like Save this"], "caption": "the post caption with 1-2 emoji", "hashtags": ["three", "relevant", "hashtags"], "rationale": "one sentence on why this should perform, tied to the style memory", "overlayText": "same as filledHook", "script": "", "scenePlan": [], "variablesUsed": {"placeholder":"value"} }',
    "",
    "Rules:",
    "- Keep the slideshow on-brand, varied, and genuinely good.",
    "- Do not write generic filler.",
    "- The first slide must create curiosity, tension, or a clear identity callout.",
    "- Middle slides must pay off the hook with concrete, relatable points.",
    "- Each slide must be short enough for a vertical carousel image.",
    "- Use simple human language. Avoid technical or robotic copy.",
    "- Do not invent fake stats, fake studies, fake quotes, or fake testimonials.",
    "- Product details are context, not a sales script.",
    "- Do not mention implementation details, model names, template names, or hidden source names.",
    "- Return only the JSON object.",
    scriptIdea ? `User creative direction: ${scriptIdea}` : "",
    `Placeholder fillers: ${JSON.stringify(fillers)}`,
    `Candidate templates: ${JSON.stringify(
      candidates.map((candidate) => ({
        templateId: candidate.id,
        template: candidate.template,
        requiredVariables: candidate.requiredVariables,
        source: candidate.source,
      })),
    )}`,
  ]
    .filter(Boolean)
    .join("\n");
}
