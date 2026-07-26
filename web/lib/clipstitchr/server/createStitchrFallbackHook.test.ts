import { describe, expect, it } from "vitest";
import { createStitchrFallbackHook } from "@/lib/clipstitchr/server/createStitchrFallbackHook";
import { sanitizeCliprGeneratedText } from "@/lib/clipstitchr/utils/sanitizeCliprGeneratedText";

describe("createStitchrFallbackHook", () => {
  it("turns the saved audience pain into a creator thought", () => {
    expect(
      createStitchrFallbackHook({
        candidates: [
          {
            active: true,
            allowedPurposes: ["stitchr"],
            bestFor: [],
            emotionalTrigger: "recognition",
            id: "UGD-001",
            requiredVariables: ["habit", "problem"],
            riskLevel: "safe",
            source: "ugc_discovery_patterns",
            styleKey: "vulnerable_reveal",
            template:
              "not me realizing {{habit}} was making {{problem}} harder",
          },
        ],
        product: {
          audienceDetails: "Beginner founders",
          cliprPlaceholderFillers: {
            habit: ["scattered launch work"],
            problem: ["launch planning"],
          },
          createdAt: "2026-07-25T00:00:00.000Z",
          id: "launchkit",
          inferredPainPoints: ["launch work keeps getting scattered"],
          name: "LaunchKit",
          productDetails: "Organizes launch work.",
          updatedAt: "2026-07-25T00:00:00.000Z",
        },
        variationSeed: "stitchr-batch:run:1",
      }),
    ).toBe(
      "not me realizing scattered launch work was making launch planning harder",
    );
  });

  it("varies the safe fallback when no template can be filled", () => {
    const product = {
      audienceDetails: "Beginner founders",
      createdAt: "2026-07-25T00:00:00.000Z",
      id: "launchkit",
      inferredPainPoints: [],
      name: "LaunchKit",
      productDetails: "Organizes launch work.",
      updatedAt: "2026-07-25T00:00:00.000Z",
    };
    const hooks = Array.from({ length: 10 }, (_, index) =>
      createStitchrFallbackHook({
        candidates: [],
        product,
        variationSeed: `stitchr-batch:run:${index + 1}`,
      }),
    );

    expect(new Set(hooks).size).toBe(10);
    expect(
      hooks.every((hook) => sanitizeCliprGeneratedText(hook, hook) === hook),
    ).toBe(true);
  });

  it("uses an opener-safe thought instead of unrelated generic fillers", () => {
    const hook = createStitchrFallbackHook({
      candidates: [
        {
          active: true,
          allowedPurposes: ["stitchr"],
          bestFor: [],
          emotionalTrigger: "recognition",
          id: "UGD-285",
          requiredVariables: ["habit"],
          riskLevel: "safe",
          source: "ugc_discovery_patterns",
          styleKey: "identity_challenge",
          template: "tell me why I thought {{habit}} counted as a real system",
        },
      ],
      product: {
        audienceDetails: "",
        createdAt: "2026-07-25T00:00:00.000Z",
        id: "sparse",
        inferredPainPoints: [],
        name: "Sparse product",
        productDetails: "",
        updatedAt: "2026-07-25T00:00:00.000Z",
      },
      variationSeed: "stitchr-batch:run:9",
    });

    expect(hook).toBe(
      "tell me why I thought progress needed another restart to make sense",
    );
    expect(hook).not.toContain("content");
  });
});
