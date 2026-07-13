import type { AdVariantCalculatorInput } from "@/lib/clipstitchr/tools/adVariantCalculator/AdVariantCalculatorInput";
import type { AdVariantTestPhase } from "@/lib/clipstitchr/tools/adVariantCalculator/AdVariantTestPhase";

export function createAdVariantTestPhases(
  input: AdVariantCalculatorInput,
  practicalFirstBatchCount: number,
): AdVariantTestPhase[] {
  const baselineTextDirection =
    input.hookCount && input.callToActionCount
      ? "Keep one hook and one call to action fixed"
      : "Add one hook and one call to action, then keep both fixed";
  const firstPhaseDescription = practicalFirstBatchCount
    ? `Pair ${practicalFirstBatchCount} UGC ${
        practicalFirstBatchCount === 1 ? "clip" : "clips"
      } with one demo. ${baselineTextDirection} so you can see which opening footage earns attention.`
    : "Add at least one UGC clip and one product demo. That gives you the simplest useful baseline to test.";
  const secondPhaseDescription = input.hookCount
    ? `Take the strongest UGC-and-demo pairing and try your ${input.hookCount} ${
        input.hookCount === 1 ? "hook" : "hooks"
      } against it. Keep everything else the same while you compare openings.`
    : "Write one clear hook for the strongest pairing. Add more hooks only after the first version gives you a baseline.";
  const thirdPhaseDescription =
    practicalFirstBatchCount === 0
      ? "Build the one-UGC-and-one-demo baseline first. Then add a new demo or call to action one at a time so each result stays useful."
      : input.demoClipCount > 1 || input.callToActionCount > 1
        ? `After one version wins, compare your ${input.demoClipCount} ${
            input.demoClipCount === 1 ? "demo" : "demos"
          } and ${input.callToActionCount} ${
            input.callToActionCount === 1 ? "call to action" : "calls to action"
          }. Change one thing at a time so the result tells you something useful.`
        : "Once the baseline has a winner, add one new demo or call to action at a time. You will know which change helped instead of guessing.";

  return [
    {
      title: "Start with the footage",
      description: firstPhaseDescription,
    },
    {
      title: "Test the opening line",
      description: secondPhaseDescription,
    },
    {
      title: "Expand the winning version",
      description: thirdPhaseDescription,
    },
  ];
}
