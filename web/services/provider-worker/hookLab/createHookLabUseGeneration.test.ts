import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCompletedOutput: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText",
  () => ({
    getCompletedReplicatePredictionOutputText: mocks.getCompletedOutput,
  }),
);

import { createHookLabUseGeneration } from "./createHookLabUseGeneration";
import { HOOK_LAB_EXACT_REUSE_GATE_NAMES } from "./hookLabExactReuseGateNames";
import { getHookLabVariationDirection } from "@/lib/clipstitchr/utils/getHookLabVariationDirection";

describe("createHookLabUseGeneration", () => {
  beforeEach(() => {
    mocks.getCompletedOutput.mockReset();
  });

  it("records one constrained rewrite when the first adaptation is too similar", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({ id: "initial-prediction" })
      .mockResolvedValueOnce({ id: "rewrite-prediction" });
    const replicate = { predictions: { create } };
    const gates = Object.fromEntries(
      HOOK_LAB_EXACT_REUSE_GATE_NAMES.map((name, index) => [
        name,
        {
          evidence: index === 0 ? "This claim needs a safer frame." : "Checked.",
          passes: index !== 0,
        },
      ]),
    );

    mocks.getCompletedOutput
      .mockResolvedValueOnce(
        JSON.stringify({
          adaptedHook: "This one trick changed everything overnight",
          caption: "Try a calmer morning.",
          exactReuseGates: gates,
          visualPrompt: "A creator reacts in one steady vertical shot.",
          visualPromptSummary: "A fresh reaction",
        }),
      )
      .mockResolvedValueOnce(
        JSON.stringify({ adaptedHook: "Your morning can start on easier terms" }),
      );

    const result = await createHookLabUseGeneration({
      audienceDetails: "Busy coffee drinkers",
      avoidPhrases: [],
      creativeBeat: {
        beats: [{ description: "A curious look turns into relief." }],
        emotionalTurn: "Curiosity to relief",
        genericObjects: ["mug"],
        mustNotCopy: ["source creator"],
        openingVisualState: "Creator holds a mug",
        payoff: "A calmer start",
      },
      productDetails: "A smooth coffee concentrate",
      productName: "Daily Brew",
      replicate: replicate as never,
      siblingHooks: [],
      textBlueprint: {
        cadence: "short",
        claimsRequiringSupport: [],
        emotionalJob: "curiosity",
        exactReuseConstraints: [],
        productSpecificTokens: [],
        reusablePattern: "A better {{topic}}",
        semanticSlots: [{ meaning: "topic", name: "topic" }],
        sourceText: "This one trick changed everything overnight",
        unresolvedVisualReferences: [],
      },
      variationDirection: getHookLabVariationDirection(0),
    });

    expect(create).toHaveBeenCalledTimes(2);
    expect(result.generatedHook).toBe("Your morning can start on easier terms");
    expect(result.predictionIds).toEqual([
      "initial-prediction",
      "rewrite-prediction",
    ]);
    expect(result.textDecisionReason).toBe(
      "This claim needs a safer frame.",
    );
  });

  it("uses the deterministic fallback when the one rewrite is still too similar", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({ id: "initial-prediction" })
      .mockResolvedValueOnce({ id: "rewrite-prediction" });
    const replicate = { predictions: { create } };
    const gates = Object.fromEntries(
      HOOK_LAB_EXACT_REUSE_GATE_NAMES.map((name) => [
        name,
        { evidence: "Exact reuse is not safe here.", passes: false },
      ]),
    );

    mocks.getCompletedOutput
      .mockResolvedValueOnce(
        JSON.stringify({
          adaptedHook: "This one trick changed everything overnight",
          caption: "Try a calmer morning.",
          exactReuseGates: gates,
          visualPrompt: "A creator reacts in one steady vertical shot.",
          visualPromptSummary: "A fresh reaction",
        }),
      )
      .mockResolvedValueOnce(
        JSON.stringify({
          adaptedHook: "This one trick changed everything overnight",
        }),
      );

    const result = await createHookLabUseGeneration({
      audienceDetails: "Busy coffee drinkers",
      avoidPhrases: [],
      creativeBeat: {
        beats: [{ description: "A curious look turns into relief." }],
        emotionalTurn: "Curiosity to relief",
        genericObjects: ["mug"],
        mustNotCopy: ["source creator"],
        openingVisualState: "Creator holds a mug",
        payoff: "A calmer start",
      },
      productDetails: "A smooth coffee concentrate",
      productName: "Daily Brew",
      replicate: replicate as never,
      siblingHooks: [],
      textBlueprint: {
        cadence: "short",
        claimsRequiringSupport: [],
        emotionalJob: "curiosity",
        exactReuseConstraints: [],
        productSpecificTokens: [],
        reusablePattern: "A better {{topic}}",
        semanticSlots: [{ meaning: "topic", name: "topic" }],
        sourceText: "This one trick changed everything overnight",
        unresolvedVisualReferences: [],
      },
      variationDirection: getHookLabVariationDirection(0),
    });

    expect(create).toHaveBeenCalledTimes(2);
    expect(result.generatedHook).toBe(
      "A better Daily Brew through a detail the audience recognizes",
    );
    expect(result.predictionIds).toEqual([
      "initial-prediction",
      "rewrite-prediction",
    ]);
  });

  it("rewrites a source-safe candidate that overlaps an earlier sibling", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({ id: "initial-prediction" })
      .mockResolvedValueOnce({ id: "rewrite-prediction" });
    const replicate = { predictions: { create } };
    const gates = Object.fromEntries(
      HOOK_LAB_EXACT_REUSE_GATE_NAMES.map((name) => [
        name,
        { evidence: "This gate needs adaptation.", passes: false },
      ]),
    );

    mocks.getCompletedOutput
      .mockResolvedValueOnce(
        JSON.stringify({
          adaptedHook: "A calmer morning starts right here",
          caption: "Try a calmer morning.",
          exactReuseGates: gates,
          visualPrompt: "A creator looks relieved.",
          visualPromptSummary: "A fresh reaction",
        }),
      )
      .mockResolvedValueOnce(
        JSON.stringify({ adaptedHook: "The rushed-coffee habit I finally dropped" }),
      );

    const direction = getHookLabVariationDirection(2);
    const result = await createHookLabUseGeneration({
      audienceDetails: "Busy coffee drinkers",
      avoidPhrases: [],
      creativeBeat: {
        beats: [{ description: "A curious look turns into relief." }],
        emotionalTurn: "Curiosity to relief",
        genericObjects: ["mug"],
        mustNotCopy: ["source creator"],
        openingVisualState: "Creator holds a mug",
        payoff: "A calmer start",
      },
      productDetails: "A smooth coffee concentrate",
      productName: "Daily Brew",
      replicate: replicate as never,
      siblingHooks: ["A calmer morning starts right here"],
      textBlueprint: {
        cadence: "short",
        claimsRequiringSupport: [],
        emotionalJob: "curiosity",
        exactReuseConstraints: [],
        productSpecificTokens: [],
        reusablePattern: "A better {{topic}}",
        semanticSlots: [{ meaning: "topic", name: "topic" }],
        sourceText: "This one trick changed everything overnight",
        unresolvedVisualReferences: [],
      },
      variationDirection: direction,
    });

    expect(result.generatedHook).toBe(
      "The rushed-coffee habit I finally dropped",
    );
    expect(result.predictionIds).toEqual([
      "initial-prediction",
      "rewrite-prediction",
    ]);
    expect(result.textDecisionReason).toContain("Another version");
    expect(result.visualPrompt).toContain(direction.visualDirection);
  });
});
