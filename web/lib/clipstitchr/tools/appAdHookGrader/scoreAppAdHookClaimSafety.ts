import type { AppAdHookGradeDimension } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGradeDimension";
import { findPublicHookClaimSignals } from "@/lib/clipstitchr/tools/publicHooks/findPublicHookClaimSignals";

export function scoreAppAdHookClaimSafety(
  hook: string,
): AppAdHookGradeDimension {
  const signals = findPublicHookClaimSignals(hook);
  const score = Math.max(0, 100 - signals.length * 25);

  return {
    key: "claim-safety",
    label: "Claim safety",
    reason:
      signals.length === 0
        ? "The hook does not rely on an obvious guarantee, statistic, or borrowed authority."
        : "Review each flagged claim and keep only wording the ad can visibly support.",
    score,
  };
}
