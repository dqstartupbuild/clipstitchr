import type { HookVisualMatchmakerInput } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualMatchmakerInput";
import type { HookVisualOpeningSource } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualOpeningSource";
import type { PublicHookIntent } from "@/lib/clipstitchr/tools/publicHooks/PublicHookIntent";
import { createHookVisualPlan } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/createHookVisualPlan";

export function createHookVisualAlternatePlan({
  input,
  intent,
  openingSource,
  primarySource,
}: {
  input: HookVisualMatchmakerInput;
  intent: PublicHookIntent;
  openingSource: HookVisualOpeningSource;
  primarySource: HookVisualOpeningSource;
}) {
  const plan = createHookVisualPlan({ input, intent, openingSource });

  if (openingSource !== primarySource) {
    return plan;
  }

  const alternateOpening = `Alternate treatment: start one beat later and lead with the clearest movement in the same ${openingSource === "text-card" ? "text-card plan" : `${openingSource.toUpperCase()} source`}.`;

  return {
    ...plan,
    openingShot: `${alternateOpening} ${plan.openingShot}`,
    storyboard: [
      {
        ...plan.storyboard[0],
        instruction: `${alternateOpening} ${plan.storyboard[0].instruction}`,
      },
      ...plan.storyboard.slice(1),
    ],
  };
}
