import type { HookLabVariationDirection } from "@/lib/clipstitchr/types/HookLabVariationDirection";

const directions = [
  {
    fallbackTopic: "a detail the audience recognizes",
    hookTreatment:
      "Lead with a direct, specific observation the audience recognizes immediately.",
    visualDirection:
      "Use a steady eye-level close-up with a small recognition reaction and direct eye contact.",
  },
  {
    fallbackTopic: "a belief worth rethinking",
    hookTreatment:
      "Use a gentle contrarian reframe that challenges the audience's first assumption.",
    visualDirection:
      "Use a steady waist-up frame with a brief head shake that turns into a knowing half-smile.",
  },
  {
    fallbackTopic: "an honest realization",
    hookTreatment:
      "Frame the hook as an honest personal realization without making unsupported claims.",
    visualDirection:
      "Use a steady seated medium close-up with a candid pause, then a subtle relieved exhale.",
  },
  {
    fallbackTopic: "a question worth answering",
    hookTreatment:
      "Open with a concrete question whose answer naturally tees up the product Demo.",
    visualDirection:
      "Use a steady three-quarter frame with one curious glance toward the Demo handoff direction.",
  },
  {
    fallbackTopic: "the friction before the easier step",
    hookTreatment:
      "Create before-and-after tension by naming the old friction and hinting at a simpler next step.",
    visualDirection:
      "Use a steady medium frame with slightly tense posture that visibly softens before the Demo cut.",
  },
] as const satisfies readonly HookLabVariationDirection[];

export function getHookLabVariationDirection(
  variantIndex: number,
): HookLabVariationDirection {
  if (!Number.isInteger(variantIndex) || variantIndex < 0) {
    throw new Error("Hook Lab version index is invalid.");
  }

  return directions[variantIndex % directions.length];
}
