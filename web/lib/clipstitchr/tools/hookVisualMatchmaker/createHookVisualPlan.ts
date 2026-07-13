import type { HookVisualMatchmakerInput } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualMatchmakerInput";
import type { HookVisualOpeningSource } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualOpeningSource";
import type { HookVisualPlan } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualPlan";
import { hookVisualIntentPatterns } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/hookVisualIntentPatterns";
import type { PublicHookIntent } from "@/lib/clipstitchr/tools/publicHooks/PublicHookIntent";
import { normalizePublicHookText } from "@/lib/clipstitchr/tools/publicHooks/normalizePublicHookText";

export function createHookVisualPlan({
  input,
  intent,
  openingSource,
}: {
  input: HookVisualMatchmakerInput;
  intent: PublicHookIntent;
  openingSource: HookVisualOpeningSource;
}): HookVisualPlan {
  const pattern = hookVisualIntentPatterns[intent];
  const openingShot =
    openingSource === "ugc"
      ? `Use this available UGC moment: ${normalizePublicHookText(input.ugcFootage)}. ${pattern.openingDirection}`
      : openingSource === "demo"
        ? `Open on this available app moment: ${normalizePublicHookText(input.demoMoment)}. ${pattern.openingDirection}`
        : "Use the hook as a clean text card. No UGC or demo moment was provided, so do not pretend a product shot exists.";
  const demoHandoff = input.demoMoment.trim()
    ? `Cut to this available demo moment: ${normalizePublicHookText(input.demoMoment)}. ${pattern.demoDirection}`
    : "No demo moment was provided. Name that missing shot in the production plan before filming.";
  const ctaBridge = input.demoMoment.trim()
    ? `After the visible product moment, bridge to: ${normalizePublicHookText(input.desiredAction)}.`
    : `Save “${normalizePublicHookText(input.desiredAction)}” until a real product moment can support it.`;

  return {
    ctaBridge,
    demoHandoff,
    onScreenText: normalizePublicHookText(input.hook),
    openingShot,
    openingSource,
    storyboard: [
      {
        instruction: openingShot,
        label: "Earn the hook",
        timeRange: "0–1.5 sec",
      },
      {
        instruction:
          openingSource === "text-card"
            ? `Introduce ${normalizePublicHookText(input.appContext)} in plain text and keep the frame uncluttered.`
            : "Hold on the clearest existing movement long enough for the overlay to be read.",
        label: "Keep one idea moving",
        timeRange: "1.5–3 sec",
      },
      {
        instruction: demoHandoff,
        label: "Hand off to the product",
        timeRange: "3–5 sec",
      },
    ],
  };
}
