import { describe, expect, it } from "vitest";
import { parseHookLabFormatDna } from "./parseHookLabFormatDna";

describe("parseHookLabFormatDna", () => {
  it("keeps observations separate from inferences", () => {
    const result = parseHookLabFormatDna({
      adObviousness: "The product appears after the hook.",
      confidence: "The edit is observed; its effect is inferred.",
      ctaStyle: "Save",
      doNotCopy: ["Creator wording"],
      editRhythm: "Fast opening, slower demo",
      firstPayoff: "The result starts to become visible.",
      firstPayoffAtSeconds: 2.2,
      hookPattern: "Delayed reveal",
      inferences: ["The delay may hold attention."],
      observedEvidence: ["The result is hidden for two seconds."],
      openingQuestion: "What changed?",
      openingVisual: "A hidden result",
      productFirstAppearsAtSeconds: 3.4,
      productRole: "helper",
      proofDevice: "visible demo",
      replicationFormula: "Hide, explain, reveal.",
      retentionDevice: "Delayed reveal",
      signatureDevice: "The cover over the result",
      soundOffSummary: "The text names the problem.",
      storyBeats: ["Problem", "Reveal"],
      storyFramework: "Problem and payoff",
    });

    expect(result.version).toBe("format-dna-v1");
    expect(result.observedEvidence).toEqual([
      "The result is hidden for two seconds.",
    ]);
    expect(result.inferences).toEqual(["The delay may hold attention."]);
    expect(result.productFirstAppearsAtSeconds).toBe(3.4);
    expect(result.firstPayoffAtSeconds).toBe(2.2);
  });

  it("rejects reports without format DNA", () => {
    expect(() => parseHookLabFormatDna(null)).toThrow(
      "did not include reusable format DNA",
    );
  });
});
