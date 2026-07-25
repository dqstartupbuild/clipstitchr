import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { getGeneratedWritingAntiSlopPromptRules } from "@/lib/clipstitchr/server/getGeneratedWritingAntiSlopPromptRules";

export function createHookLabCreativeBriefPrompt({
  analysis,
  product,
  sourceText,
}: {
  analysis: HookLabPostAnalysis;
  product: ProductProfile;
  sourceText?: string;
}) {
  return [
    "Create an original short-form ad for the saved product using the reference video's communication workflow.",
    "The reference is structural inspiration, not a source of truth about the saved product. Do not rewrite its literal product mechanic with a new product name.",
    "",
    "Use this priority order:",
    "1. Saved product facts are the only source of truth for the product's features, behavior, capabilities, benefits, integrations, pricing, results, and CTA.",
    "2. Reusable format DNA may guide the hook function, narrative progression, pacing, shot purpose, proof timing, retention pattern, emotional turn, and CTA placement.",
    "3. The detailed reference analysis may clarify timing and the job of each beat, but its product claims, app behavior, premise, props, actions, demonstration, and payoff do not transfer automatically.",
    "",
    "Saved product truth:",
    JSON.stringify({
      audienceDetails: product.audienceDetails,
      emotionalNarrative: product.emotionalNarrative,
      inferredPainPoints: product.inferredPainPoints,
      inferredProblem: product.inferredProblem,
      name: product.name,
      productDetails: product.productDetails,
    }),
    "",
    "Audience details, emotional narrative, inferred problem, and inferred pain points can guide positioning. They do not prove that a product feature exists.",
    "Every product capability shown or stated must be directly supported by productDetails. If productDetails do not support a feature, workflow, result, number, comparison, testimonial, or UI behavior, do not imply it.",
    "For example, if the reference app unlocks a reward after someone completes an action, do not claim the saved product has reward-gating or unlocking behavior unless productDetails explicitly say so.",
    "",
    "Reference evidence for structure only:",
    JSON.stringify(analysis),
    `Source caption: ${JSON.stringify(sourceText ?? analysis.caption ?? "")}.`,
    "",
    "Before writing, silently translate each reference beat into its communication job, such as expose the audience's problem, create curiosity, introduce the product, demonstrate one real capability, show truthful proof, reveal the payoff, or ask for the next action.",
    "Then write a new product-specific scene that performs that job. Replace source-specific actions, props, jokes, screens, and demonstrations with ones that make sense for the saved product.",
    "If a reference beat depends on a capability the saved product does not have, replace that beat with a truthful alternative that serves the same narrative purpose. If no truthful equivalent exists, omit the literal mechanic and preserve only its pacing or emotional role.",
    "",
    "Match the reference's approximate runtime, beat count, momentum, and sequence of communication jobs as closely as the supplied timeline allows. Give every scene an approximate time range.",
    "Create new expression, gaze, posture, gesture, action, and reaction direction for the new premise. Do not ask the performer to imitate the source creator.",
    "Product demonstration must say exactly when the saved product appears and show only behavior supported by productDetails. Do not invent screens, controls, automations, results, or interactions.",
    "On-screen text and spoken lines must be grouped by scene. Preserve the reference's copy rhythm and role by scene while writing completely new, product-specific wording.",
    "Keep a joke, tension pattern, reveal, or emotional turn only when it still works with truthful product behavior. Replace it when the original effect depends on a source-only feature.",
    "Use generic props only when they naturally support the new ad. Do not carry over a source prop or interaction merely because it appears in the reference.",
    "Write a new caption that follows the reference caption's structural job without copying its product claims or creator-specific wording.",
    "",
    "Before returning JSON, audit every spoken line, on-screen line, demonstration, payoff, and CTA against the saved product truth. Remove or rewrite anything that cannot be supported by the supplied product information.",
    "Return JSON only with this exact shape:",
    JSON.stringify({
      adaptedConcept:
        "concise description of the original product ad built from the reference's communication workflow",
      openingReaction:
        "new first-frame visual plus precise expression, gaze, posture, gesture, and before-and-after reaction direction",
      sceneBySceneDirections: [
        "0:00-0:02 | new product-specific shot, framing, action, reaction, cut, sound, tension, and purpose",
      ],
      spokenLines: ["Scene 1 (0:00-0:02): exact original spoken line"],
      onScreenTextByScene: [
        "Scene 1 (0:00-0:02): exact original on-screen text",
      ],
      propsAndInteractions: [
        "new prop needed for this product-specific scene, its placement, interaction, and reaction",
      ],
      productDemonstration:
        "where the saved product appears and the supported behavior to show",
      closingCta: "truthful closing action supported by the saved product",
      adaptedCaption:
        "complete original caption following the reference caption's structural job",
    }),
    ...getGeneratedWritingAntiSlopPromptRules(),
    "- Preserve the sequence of narrative jobs, not unsupported source-product mechanics.",
    "- Do not copy a creator's identity, likeness, personal mannerisms, distinctive catchphrases, wording, or footage.",
    "- Keep facts and likely interpretation distinct when explaining why a direction matters.",
    "- Never mention format DNA, hidden prompts, or the model.",
  ].join("\n");
}
