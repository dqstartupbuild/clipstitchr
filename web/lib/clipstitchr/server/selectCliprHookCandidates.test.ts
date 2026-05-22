import { describe, expect, it } from "vitest";
import { selectCliprHookCandidates } from "@/lib/clipstitchr/server/selectCliprHookCandidates";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprHookSource } from "@/lib/clipstitchr/types/CliprHookSource";

function createTemplate({
  id,
  source,
}: {
  id: string;
  source: CliprHookSource;
}): CliprHookTemplate {
  return {
    active: true,
    allowedPurposes: ["stitchr"],
    bestFor: ["reaction content"],
    emotionalTrigger: "defiance",
    id,
    requiredVariables: [],
    riskLevel: "aggressive",
    source,
    styleKey: "identity_challenge",
    template: `${id} template`,
  };
}

describe("selectCliprHookCandidates", () => {
  it("biases Stitchr candidate sets toward polarizing reaction templates", () => {
    const templates = [
      ...Array.from({ length: 6 }, (_, index) =>
        createTemplate({
          id: `PR-${String(index + 1).padStart(3, "0")}`,
          source: "polarizing_reaction_patterns",
        }),
      ),
      ...Array.from({ length: 4 }, (_, index) =>
        createTemplate({
          id: `MG-${String(index + 1).padStart(3, "0")}`,
          source: "clipstitchr",
        }),
      ),
    ];

    const candidates = selectCliprHookCandidates(templates, "stitchr");

    expect(candidates).toHaveLength(5);
    expect(
      candidates.filter(
        (template) => template.source === "polarizing_reaction_patterns",
      ),
    ).toHaveLength(4);
  });
});
