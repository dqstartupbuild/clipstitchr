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
    "",
    "Creative standard:",
    "- Write for the viewer first. The product is context, not the main character.",
    "- The hook should make the viewer feel seen, curious, or slightly called out.",
    "- Do not open with the product name unless the user explicitly asked for that.",
    "- Build one clean idea from slide to slide: hook, why it happens, what it costs, the simple reframe, the payoff, then a soft CTA.",
    "- Every middle slide must answer or deepen the slide before it. No random tips, no disconnected claims, no filler.",
    "- Give the audience useful language, a helpful reframe, or a small next step they would actually care about.",
    "- Use product facts only as quiet background proof. Mention the app, download, or website only if it naturally fits the final CTA.",
    "- The final slide should be a soft CTA such as follow for more, comment with a question, like if it hit home, visit the site, or download the app when ready.",
    "- Do not default to a bookmark-style CTA.",
    "- Avoid generic creator advice like work smarter, unlock growth, level up, or game changer.",
    "Respond with a JSON object of this exact shape:",
    '{ "templateId": "one candidate id", "filledHook": "the first slide — a scroll-stopping viewer-first line, max ~8 words", "slides": ["the hook again as slide 1", "why it happens", "what it costs", "the simple reframe", "...same count requested, each max ~8 words, last is a soft CTA"], "caption": "the post caption with 1-2 emoji", "hashtags": ["three", "relevant", "hashtags"], "rationale": "one sentence on why this should perform, tied to the style memory", "overlayText": "same as filledHook", "script": "", "scenePlan": [], "variablesUsed": {"placeholder":"value"} }',
    "",
    "Rules:",
    "- Keep the slideshow on-brand, varied, and genuinely good.",
    "- Do not write generic filler or vague hype.",
    "- The first slide must hook the viewer's life, pain, desire, or belief before the product.",
    "- Middle slides must pay off the hook with a coherent mini-story or useful framework.",
    "- Each slide must be short enough for a vertical carousel image.",
    "- Use simple human language. Avoid technical or robotic copy.",
    "- Do not invent fake stats, fake studies, fake quotes, or fake testimonials.",
    "- Product details are context, not a sales script.",
    "- Keep product mentions out of middle slides unless the user specifically requested product-heavy copy.",
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
