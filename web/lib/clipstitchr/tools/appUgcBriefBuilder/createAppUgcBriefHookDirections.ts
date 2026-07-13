import type { AppUgcBriefInput } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefInput";

export function createAppUgcBriefHookDirections(
  input: AppUgcBriefInput,
): string[] {
  return [
    `Audience callout: Speak to ${input.audience.trim()} and name the moment when ${input.problem.trim()}.`,
    `Problem moment: Show or describe ${input.problem.trim()}, then create a natural reason to see ${input.keyFeature.trim()}.`,
    `Outcome lead: Start with the desire to ${input.desiredOutcome.trim()}, then let the product demo show how ${input.keyFeature.trim()} supports it.`,
  ];
}
