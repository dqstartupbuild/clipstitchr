import { cliprHookStyles } from "@/lib/clipstitchr/resources/clipr/cliprHookStyles";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import type { ProductEnrichmentInput } from "@/lib/clipstitchr/types/ProductEnrichmentInput";
import { getGeneratedWritingAntiSlopPromptRules } from "@/lib/clipstitchr/server/getGeneratedWritingAntiSlopPromptRules";

const MIN_FILLERS_PER_KEY = 6;
const MAX_FILLERS_PER_KEY = 16;

const productEnrichmentHookTemplates = cliprHookTemplates.filter(
  (template) =>
    template.source === "clipstitchr" ||
    template.source === "polarizing_reaction_patterns" ||
    template.styleKey === "identity_challenge",
);

function getHookStylePromptText() {
  return cliprHookStyles
    .map(
      (style) =>
        `${style.styleKey}: ${style.styleName} - ${style.coreIntent}. Best for ${style.bestFor.join(", ")}.`,
    )
    .join("\n");
}

function getHookTemplatePromptText() {
  return productEnrichmentHookTemplates
    .map((template) => `${template.id} (${template.styleKey}): ${template.template}`)
    .join("\n");
}

function getPlaceholderKeyPromptText() {
  return Array.from(
    new Set(
      productEnrichmentHookTemplates.flatMap(
        (template) => template.requiredVariables,
      ),
    ),
  )
    .sort()
    .join(", ");
}

export function createProductEnrichmentPrompt({
  audienceDetails,
  emotionalNarrative,
  name,
  productDetails,
  websiteDetails,
  websiteUrl,
}: ProductEnrichmentInput) {
  return [
    "Infer hidden strategic metadata for this saved product profile.",
    "Write in plain speech. Keep it human, specific, and easy to say out loud.",
    "Avoid robotic strategy words like leverage, optimize, streamline, ecosystem, synergy, robust, cutting-edge, unlock, and empower unless the product input uses them.",
    "Use everyday phrases a real person would recognize. Prefer simple nouns and verbs over technical wording.",
    ...getGeneratedWritingAntiSlopPromptRules(),
    "Return only compact JSON with this exact shape:",
    '{"productDetails":"prefill candidate only when product details are blank","audienceDetails":"prefill candidate only when audience details are blank","inferredProblem":"plain one-sentence audience problem","inferredPainPoints":["plain pain point"],"emotionalNarrative":"editable emotional story for Stitchr hooks","eligibleCliprHookStyleKeys":["style_key"],"eligibleCliprHookTemplateIds":["TEMPLATE-001"],"cliprPlaceholderFillers":{"placeholder_key":["natural filler"]}}',
    "Use 8 to 14 concise pain points. Keep every string under 120 characters. Do not invent regulated claims, pricing, guarantees, or unsupported facts.",
    "Make the enrichment audience-first. The main inventory should be audience beliefs, embarrassing mistakes, desired status, objections, daily situations, and problem language.",
    "If Product details is blank, infer productDetails from the website and product name as a concise, useful plain-language product summary. Include what it does, who it helps, concrete features or proof, and the outcome it promises. If Product details is not blank, return an empty string for productDetails.",
    "If Audience details is blank, infer audienceDetails from the website and product context as a concise description of the real buyer or user. Include their role, situation, problem, and buying motivation. If Audience details is not blank, return an empty string for audienceDetails.",
    "Never overwrite user-provided Product details or Audience details. productDetails and audienceDetails in your JSON are prefill candidates only for blank user fields.",
    "Infer emotionalNarrative when the user did not provide one. It should describe the likely emotional pain, desired identity shift, social or personal payoff, and the emotional open loop Stitchr hooks should imply.",
    "If the user provided an emotional narrative, preserve its story and concrete details while cleaning up only obvious awkward phrasing.",
    "For emotionalNarrative, focus on what the person is embarrassed about, tired of, secretly hoping for, trying to become, and hoping other people will notice.",
    "Write emotionalNarrative as one editable paragraph under 900 characters. It is for reaction-based Stitchr overlay hooks, not a feature list or ad script.",
    "Treat product details as a proof bank, not as the source of every script. Do not turn every product feature into a filler.",
    "Choose every relevant Clipr hook style, not just a few. Include a style if it can produce honest, natural content for this product and audience.",
    "Choose every relevant template ID from the template list. Be broad. Exclude only templates that would force a false claim, fake proof, fake urgency, or awkward wording.",
    `For cliprPlaceholderFillers, include ${MIN_FILLERS_PER_KEY} to ${MAX_FILLERS_PER_KEY} values for every placeholder key that can be filled honestly. Cover hundreds of useful hook scenarios across the full key list.`,
    "Make filler values short, concrete, and conversational. Good fillers sound like things a person would say, not a consultant deck.",
    "Keep fillers non-promotional. They should help make relatable engagement hooks, not direct ads.",
    "Use the product details for context, but do not repeat the product name, product features, app flow, onboarding steps, scans, dashboards, or generated plans in every filler.",
    "For topic, thing, workflow, task, habit, and category fillers: prefer the audience's real problem language over product feature language.",
    "For core_belief, common_assumption, controversial_take, audience, identity, and popular_method fillers: write beliefs the audience would emotionally defend, specific identity labels they use for themselves, and concrete methods or habits they consider part of who they are. These must feel personal enough that challenging them would cause a reaction.",
    "For number, time, and timeframe fillers: use specific quantities, costs, and durations from the niche rather than vague approximations. Prefer '3 hours editing one TikTok' over 'some time' and '$47/mo on subscriptions' over 'money'.",
    "Do not include markdown.",
    "Available Clipr hook styles:",
    getHookStylePromptText(),
    "Available Clipr template IDs:",
    getHookTemplatePromptText(),
    "Available placeholder keys:",
    getPlaceholderKeyPromptText(),
    `Product name: ${name.trim()}`,
    websiteUrl ? `Product website URL: ${websiteUrl.trim()}` : "",
    emotionalNarrative
      ? `User-provided emotional narrative: ${emotionalNarrative.trim()}`
      : "",
    `Product details: ${productDetails.trim()}`,
    websiteDetails ? `Website details for analysis only: ${websiteDetails.trim()}` : "",
    `Audience details: ${audienceDetails.trim()}`,
  ].filter(Boolean).join("\n");
}
