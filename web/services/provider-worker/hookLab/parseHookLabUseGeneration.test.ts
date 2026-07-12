import { describe, expect, it } from "vitest";
import { parseHookLabUseGeneration } from "./parseHookLabUseGeneration";

describe("parseHookLabUseGeneration", () => {
  it("defaults omitted exact-reuse gates to false", () => {
    const result = parseHookLabUseGeneration(
      JSON.stringify({
        adaptedHook: "A fresh way to see this product",
        caption: "A useful caption",
        exactReuseGates: {
          claimsAreSupported: {
            evidence: "The product details support the only claim.",
            passes: true,
          },
          hasNoSourceSpecificTokens: { passes: true },
        },
        visualPrompt: "A creator reacts in one continuous vertical shot.",
        visualPromptSummary: "Fresh creator reaction",
      }),
    );

    expect(result.exactReuseGates.claimsAreSupported).toBe(true);
    expect(result.exactReuseGates.hasNoSourceSpecificTokens).toBe(false);
    expect(result.exactReuseEvidence.claimsAreSupported).toBe(
      "The product details support the only claim.",
    );
    expect(result.adaptedHook).toBe("A fresh way to see this product");
  });
});
