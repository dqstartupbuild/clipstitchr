import { cliprHookStyles } from "@/lib/clipstitchr/resources/clipr/cliprHookStyles";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";

const MIN_FILLERS_PER_KEY = 6;
const MAX_FILLERS_PER_KEY = 16;

function getHookStylePromptText() {
  return cliprHookStyles
    .map(
      (style) =>
        `${style.styleKey}: ${style.styleName} - ${style.coreIntent}. Best for ${style.bestFor.join(", ")}.`,
    )
    .join("\n");
}

function getHookTemplatePromptText() {
  return cliprHookTemplates
    .map((template) => `${template.id} (${template.styleKey}): ${template.template}`)
    .join("\n");
}

function getPlaceholderKeyPromptText() {
  return Array.from(
    new Set(
      cliprHookTemplates.flatMap((template) => template.requiredVariables),
    ),
  )
    .sort()
    .join(", ");
}

export function createProductEnrichmentPrompt({
  audienceDetails,
  name,
  productDetails,
}: {
  audienceDetails: string;
  name: string;
  productDetails: string;
}) {
  return [
    "Infer hidden strategic metadata for this saved product profile.",
    "Write in plain speech. Keep it human, specific, and easy to say out loud.",
    "Avoid robotic strategy words like leverage, optimize, streamline, ecosystem, synergy, robust, cutting-edge, unlock, and empower unless the product input uses them.",
    "Use everyday phrases a real person would recognize. Prefer simple nouns and verbs over technical wording.",
    "Return only compact JSON with this exact shape:",
    '{"inferredProblem":"plain one-sentence problem","inferredPainPoints":["plain pain point"],"eligibleCliprHookStyleKeys":["style_key"],"eligibleCliprHookTemplateIds":["TEMPLATE-001"],"cliprPlaceholderFillers":{"placeholder_key":["natural filler"]}}',
    "Use 6 to 10 concise pain points. Keep every string under 120 characters. Do not invent regulated claims, pricing, guarantees, or unsupported facts.",
    "Choose every relevant Clipr hook style, not just a few. Include a style if it can produce honest, natural content for this product and audience.",
    "Choose every relevant template ID from the template list. Be broad. Exclude only templates that would force a false claim, fake proof, fake urgency, or awkward wording.",
    `For cliprPlaceholderFillers, include ${MIN_FILLERS_PER_KEY} to ${MAX_FILLERS_PER_KEY} values for every placeholder key that can be filled honestly. Cover hundreds of useful hook scenarios across the full key list.`,
    "Make filler values short, concrete, and conversational. Good fillers sound like things a person would say, not a consultant deck.",
    "Keep fillers non-promotional. They should help make relatable engagement hooks, not direct ads.",
    "Use the product details for context, but do not repeat the product name in every filler.",
    "Do not include markdown.",
    "Available Clipr hook styles:",
    getHookStylePromptText(),
    "Available Clipr template IDs:",
    getHookTemplatePromptText(),
    "Available placeholder keys:",
    getPlaceholderKeyPromptText(),
    `Product name: ${name.trim()}`,
    `Product details: ${productDetails.trim()}`,
    `Audience details: ${audienceDetails.trim()}`,
  ].join("\n");
}
