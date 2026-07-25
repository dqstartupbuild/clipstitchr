import { describe, expect, it } from "vitest";
import { selectCliprHookCandidates } from "@/lib/clipstitchr/server/selectCliprHookCandidates";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
function createTemplate(id: string): CliprHookTemplate {
  return {
    active: true,
    allowedPurposes: ["clipr"],
    bestFor: ["reaction content"],
    emotionalTrigger: "defiance",
    id,
    requiredVariables: [],
    riskLevel: "aggressive",
    source: "clipstitchr",
    styleKey: "identity_challenge",
    template: `${id} template`,
  };
}

describe("selectCliprHookCandidates", () => {
  it("returns a bounded candidate set for non-Stitchr generation", () => {
    const templates = Array.from({ length: 10 }, (_, index) =>
      createTemplate(`MG-${String(index + 1).padStart(3, "0")}`),
    );
    const candidates = selectCliprHookCandidates(templates);

    expect(candidates).toHaveLength(5);
    expect(new Set(candidates.map((template) => template.id)).size).toBe(5);
  });
});
