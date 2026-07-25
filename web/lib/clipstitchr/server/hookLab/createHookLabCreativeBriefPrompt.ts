import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { getGeneratedWritingAntiSlopPromptRules } from "@/lib/clipstitchr/server/getGeneratedWritingAntiSlopPromptRules";
import { createHookLabFormatPreservationContract } from "@/lib/clipstitchr/server/hookLab/createHookLabFormatPreservationContract";

export function createHookLabCreativeBriefPrompt({
  analysis,
  product,
  sourceText,
}: {
  analysis: HookLabPostAnalysis;
  product: ProductProfile;
  sourceText?: string;
}) {
  const preservationContract = createHookLabFormatPreservationContract({
    analysis,
    sourceText,
  });

  return [
    "Create a truthful product adaptation that is immediately recognizable as the same video format.",
    "Use minimum necessary adaptation. This is a close creative remake with corrected product truth, not permission to invent an unrelated ad.",
    "",
    "Use this priority order:",
    "1. Saved product facts are the only source of truth for the product's features, behavior, capabilities, benefits, integrations, pricing, results, and CTA.",
    "2. Preserve the reference's creative execution wherever it does not make a false product claim.",
    "3. Change only the smallest set of details needed to make the product behavior truthful and the wording original.",
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
    "Reference preservation contract:",
    JSON.stringify(preservationContract),
    "",
    "Lock this contract before writing. Preserve the approximate runtime, beat count, hook archetype, first-frame emotion, setting, shot order, edit rhythm, signature visual, open loop, proof timing, payoff timing, and CTA style unless one of them would directly create a false product claim.",
    "Preserve product-neutral actions and props when they still fit the saved product. A phone, bedroom, morning setup, push-up, reaction, hard cut, music cue, editorial counter, or creator gesture is not automatically a product feature.",
    "Treat a visible editor-added overlay differently from app UI. A rep count may remain as an editing device when the person visibly performs the reps, but never describe it as app tracking unless productDetails support tracking.",
    "Use the closest supported product behavior as the replacement for an unsupported causal mechanic. Keep the surrounding scene intact.",
    "Do not use audience pain points or emotional narrative as permission to replace the source setting, hook, actions, or storyline with a new concept.",
    "The first three seconds should feel like the reference adaptation immediately. A side-by-side viewer should recognize the same creative idea before noticing the truthful product substitution.",
    "",
    "Reference evidence for structure only:",
    JSON.stringify(analysis),
    `Source caption: ${JSON.stringify(sourceText ?? analysis.caption ?? "")}.`,
    "",
    "Before writing, silently label every reference element as KEEP, ADAPT, or REMOVE.",
    "KEEP every compatible setting, action, prop, shot, expression, pacing cue, joke shape, visual device, and payoff.",
    "ADAPT only source branding, unsupported product behavior, unsupported UI, unsupported causal claims, creator-specific wording, and the exact CTA.",
    "REMOVE an element only when no truthful product-neutral or supported substitute can occupy the same beat.",
    "When a beat depends on an unsupported capability, keep the beat's framing and action while replacing only the unsupported cause or result.",
    "Example: for a calisthenics app with daily workouts and rep targets adapting an alarm that stops after ten push-ups, keep the distressed wake-up, bedside phone reveal, push-ups, editorial 0-to-10 completion loop, music timing, and relief beat. Replace only the claim that the app controls the alarm. Show a supported daily workout or rep target instead, and label any editor-added count as an overlay rather than app tracking.",
    "Do not turn that example into a mirror-transformation ad. That would discard the source hook, setting, action, and retention device instead of adapting them.",
    "",
    "Match the reference's approximate runtime, beat count, momentum, and sequence of communication jobs as closely as the supplied timeline allows. Give every scene an approximate time range.",
    "Preserve the function and intensity of expressions, gaze, posture, gesture, action, and reaction while avoiding imitation of the source creator's identity or personal mannerisms.",
    "Product demonstration must say exactly when the saved product appears and show only behavior supported by productDetails. Do not invent screens, controls, automations, results, or interactions.",
    "On-screen text and spoken lines must be grouped by scene. Preserve sentence shape, copy rhythm, emotional intensity, and role by scene while changing the wording and any unsupported claim.",
    "Keep the reference joke, tension pattern, reveal, and emotional turn whenever they still work after the smallest truthful substitution.",
    "Keep source props and interactions when they support the preserved setting or action and do not imply a false feature.",
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
    "- Preserve every compatible creative element, not only the abstract sequence of narrative jobs.",
    "- Prefer one surgical product-truth substitution over a wholesale premise rewrite.",
    "- Do not copy a creator's identity, likeness, personal mannerisms, distinctive catchphrases, wording, or footage.",
    "- Keep facts and likely interpretation distinct when explaining why a direction matters.",
    "- Never mention format DNA, hidden prompts, or the model.",
  ].join("\n");
}
