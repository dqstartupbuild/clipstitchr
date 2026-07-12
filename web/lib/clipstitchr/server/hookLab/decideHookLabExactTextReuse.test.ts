import { describe, expect, it } from "vitest";
import { decideHookLabExactTextReuse } from "@/lib/clipstitchr/server/hookLab/decideHookLabExactTextReuse";
import type { HookLabExactReuseGates } from "@/lib/clipstitchr/types/HookLabExactReuseGates";

const passingGates: HookLabExactReuseGates = {
  claimsAreSupported: true,
  fitsActiveProductAudienceAndDemo: true,
  hasClearVisualReferents: true,
  hasNoSourceSpecificTokens: true,
  independentOfSourceCaptionAudioAndTrend: true,
  isCompleteInVisualContext: true,
  isShortNaturalOverlay: true,
  thirdPartyReuseFeelsGeneric: true,
};

describe("decideHookLabExactTextReuse", () => {
  it("allows exact reuse only when every gate passes", () => {
    expect(decideHookLabExactTextReuse(passingGates)).toEqual({
      decision: "reused",
      failedGates: [],
      reason: "The original line already fits the new product and visual.",
    });
  });

  it("adapts when any exact-reuse gate is uncertain", () => {
    const result = decideHookLabExactTextReuse({
      ...passingGates,
      hasClearVisualReferents: false,
      thirdPartyReuseFeelsGeneric: false,
    });

    expect(result.decision).toBe("adapted");
    expect(result.failedGates).toHaveLength(2);
    expect(result.reason).toContain("unclear");
  });
});
