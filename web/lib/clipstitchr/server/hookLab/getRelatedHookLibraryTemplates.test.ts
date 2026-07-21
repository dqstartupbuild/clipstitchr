import { describe, expect, it, vi } from "vitest";
import { getRelatedHookLibraryTemplates } from "./getRelatedHookLibraryTemplates";

vi.mock("server-only", () => ({}));

const formatDna = {
  adObviousness: "After the opening",
  confidence: "Structure observed, effect inferred",
  ctaStyle: "Save",
  doNotCopy: ["Creator wording"],
  editRhythm: "Fast",
  firstPayoff: "A result starts to appear",
  firstPayoffAtSeconds: 2,
  hookPattern: "problem question and delayed reveal",
  inferences: ["The delay may hold attention"],
  observedEvidence: ["The result is covered"],
  openingQuestion: "What fixed this problem?",
  openingVisual: "Covered result",
  productFirstAppearsAtSeconds: 4,
  productRole: "helper",
  proofDevice: "visible demo",
  replicationFormula: "Ask, explain, reveal",
  retentionDevice: "delayed reveal",
  signatureDevice: "covered result",
  soundOffSummary: "Text names the problem",
  storyBeats: ["Problem", "Proof"],
  storyFramework: "problem solution payoff",
  version: "format-dna-v1",
};

describe("getRelatedHookLibraryTemplates", () => {
  it("returns three bounded active templates", () => {
    const result = getRelatedHookLibraryTemplates(formatDna, "clipr");

    expect(result).toHaveLength(3);
    expect(result.every((template) => template.purposes.includes("clipr"))).toBe(
      true,
    );
    expect(new Set(result.map((template) => template.id)).size).toBe(3);
    expect(new Set(result.map((template) => template.categoryKey)).size).toBe(3);
  });
});
