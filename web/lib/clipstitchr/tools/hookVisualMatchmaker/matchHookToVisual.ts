import type { HookVisualMatchmakerInput } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualMatchmakerInput";
import type { HookVisualMatchResult } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualMatchResult";
import { createHookVisualPlan } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/createHookVisualPlan";
import { createHookVisualAlternatePlan } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/createHookVisualAlternatePlan";
import { getHookVisualAlternateSource } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/getHookVisualAlternateSource";
import { getHookVisualOpeningSource } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/getHookVisualOpeningSource";
import { hookVisualIntentPatterns } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/hookVisualIntentPatterns";
import { detectPublicHookIntent } from "@/lib/clipstitchr/tools/publicHooks/detectPublicHookIntent";
import { findPublicHookClaimSignals } from "@/lib/clipstitchr/tools/publicHooks/findPublicHookClaimSignals";

export function matchHookToVisual(
  input: HookVisualMatchmakerInput,
): HookVisualMatchResult {
  const intent = detectPublicHookIntent({
    audience: input.audience,
    desiredOutcome: input.desiredAction,
    hook: input.hook,
  });
  const primarySource = getHookVisualOpeningSource(input, intent);
  const alternateSource = getHookVisualAlternateSource(input, primarySource);
  const claimSignals = findPublicHookClaimSignals(input.hook);

  return {
    alternate: createHookVisualAlternatePlan({
      input,
      intent,
      openingSource: alternateSource,
      primarySource,
    }),
    ...(claimSignals.length
      ? {
          claimNotice:
            "This hook includes a claim that needs visible support. Keep it only when the footage clearly proves the wording.",
        }
      : {}),
    explanation: hookVisualIntentPatterns[intent].reason,
    intent,
    primary: createHookVisualPlan({ input, intent, openingSource: primarySource }),
  };
}
