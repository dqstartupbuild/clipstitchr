import type { HookLabExactReuseGates } from "@/lib/clipstitchr/types/HookLabExactReuseGates";
import type { HookLabTextReuseDecision } from "@/lib/clipstitchr/types/HookLabTextReuseDecision";

export function decideHookLabExactTextReuse(
  gates: HookLabExactReuseGates,
): HookLabTextReuseDecision {
  const gateLabels: [keyof HookLabExactReuseGates, string][] = [
    ["isCompleteInVisualContext", "The line is incomplete in the new visual."],
    ["hasClearVisualReferents", "A person, object, or placeholder is unclear."],
    [
      "fitsActiveProductAudienceAndDemo",
      "The line does not naturally fit this product and demo.",
    ],
    ["hasNoSourceSpecificTokens", "The line includes source-specific wording."],
    ["claimsAreSupported", "The line includes a claim that is not supported."],
    [
      "independentOfSourceCaptionAudioAndTrend",
      "The line depends on source-only context.",
    ],
    ["isShortNaturalOverlay", "The line is not ready for a short overlay."],
    [
      "thirdPartyReuseFeelsGeneric",
      "Exact reuse would make the result feel copied.",
    ],
  ];
  const failedGates = gateLabels.flatMap(([gate, label]) =>
    gates[gate] ? [] : [label],
  );

  if (failedGates.length) {
    return {
      decision: "adapted",
      failedGates,
      reason: failedGates[0],
    };
  }

  return {
    decision: "reused",
    failedGates: [],
    reason: "The original line already fits the new product and visual.",
  };
}
