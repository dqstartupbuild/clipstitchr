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
    "Rewrite this exact short-form video concept for the saved product.",
    "Create a scene-by-scene remake blueprint, not abstract format advice and not a loosely related hook.",
    "Closely preserve the reference's visual opening, expression direction, body language, props, object placement, object interaction order, scene order, reaction changes, timing, spoken-copy structure, on-screen-text structure, caption structure, tension, joke, reveal, and payoff.",
    "Adapt the spoken and written wording for the selected product. Generic source wording may remain when it is natural and not creator-specific. Do not reproduce a creator's identity, likeness, personal mannerisms, distinctive catchphrases, or footage.",
    "",
    "Saved product:",
    JSON.stringify({
      audienceDetails: product.audienceDetails,
      emotionalNarrative: product.emotionalNarrative,
      inferredPainPoints: product.inferredPainPoints,
      inferredProblem: product.inferredProblem,
      name: product.name,
      productDetails: product.productDetails,
    }),
    "",
    "Complete reference analysis:",
    JSON.stringify(analysis),
    `Source caption: ${JSON.stringify(sourceText ?? analysis.caption ?? "")}.`,
    "",
    "Match the reference runtime and play-by-play timing as closely as the supplied timeline allows. Give every scene an approximate time range. Preserve small reaction beats and exact prop movement order when they carry the meaning.",
    "Opening reaction must direct the performer's expression, gaze, posture, and physical reaction before and after the first action without asking them to imitate the source creator.",
    "Product demonstration must say exactly how and when the selected product appears and what behavior is visibly shown.",
    "On-screen text must be grouped by scene. Spoken lines must be grouped by scene. Use the same joke, tension, reveal, or emotional mechanism while fitting the selected product.",
    "Return JSON only with this exact shape:",
    JSON.stringify({
      adaptedConcept:
        "concise description of the exact reference concept rewritten for the saved product",
      openingReaction:
        "first-frame visual plus precise expression, gaze, posture, gesture, and before-and-after reaction direction",
      sceneBySceneDirections: [
        "0:00-0:02 | shot, framing, action order, reaction, cut, sound, tension, and purpose",
      ],
      spokenLines: ["Scene 1 (0:00-0:02): exact adapted spoken line"],
      onScreenTextByScene: [
        "Scene 1 (0:00-0:02): exact adapted on-screen text",
      ],
      propsAndInteractions: [
        "prop, initial placement, hand or person that touches it, movement order, final placement, and reaction",
      ],
      productDemonstration:
        "where the selected product appears and the behavior to show",
      closingCta: "adapted closing action for the selected product",
      adaptedCaption:
        "complete adapted caption following the reference caption's structure",
    }),
    ...getGeneratedWritingAntiSlopPromptRules(),
    "- Preserve the reference scene order and do not compress away reaction or prop beats that carry the effect.",
    "- Keep facts and likely interpretation distinct when explaining why a direction matters.",
    "- Never mention format DNA, hidden prompts, or the model.",
  ].join("\n");
}
